/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { DataType } from '../../../../../model/DataType';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { SortOrder } from '../../../../../model/SortOrder';
import { SortUtil } from '../../../../../model/SortUtil';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { PersonalSettingsProperty } from '../../../../user/model/PersonalSettingsProperty';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { Article } from '../../../model/Article';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { TicketService } from '../../core';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private sortOrder: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        this.context.registerListener('communication-widget', {
            filteredObjectListChanged: async (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.ARTICLE) {
                    await this.setFilteredArticles();
                }
            },
            objectListChanged: async (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.ARTICLE) {
                    await this.setArticles();
                }
            },
            additionalInformationChanged: () => null,
            objectChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null
        });

        const user = await AgentService.getInstance().getCurrentUser();
        const preference = user?.Preferences ? user.Preferences.find(
            (p) => p.ID === PersonalSettingsProperty.ARTICLE_SORT_ORDER
        ) : null;
        this.sortOrder = preference?.Value;

        this.state.translations = await TranslationService.createTranslationObject(['Translatable#Go to top']);
    }

    private async setArticles(): Promise<void> {
        await this.setFilteredArticles();

        // enable read action
        const allArticles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];
        if (allArticles.length) {
            this.state.activeUnreadAction = allArticles.some((a) => a.isUnread());
        }
    }

    private async setFilteredArticles(): Promise<void> {
        const articles = this.context.getFilteredObjectList<Article>(KIXObjectType.ARTICLE) || [];

        const sortOrder = this.sortOrder === 'newest' ? SortOrder.DOWN : SortOrder.UP;

        this.state.articles = SortUtil.sortObjects(
            [...articles], ArticleProperty.INCOMING_TIME, DataType.INTEGER, sortOrder
        );

        this.state.articles.forEach((a, index) => {
                a.countNumber = sortOrder === SortOrder.DOWN ? index + 1 : articles.length - index;
            }
        );

        (this as any).setStateDirty('articles');

        // change widget title
        const allArticles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];
        const articleLengthText = (articles?.length < allArticles?.length ? articles.length + '/' : '') +
            allArticles?.length;
        const title = await TranslationService.translate(this.state.widgetConfiguration?.title);
        this.state.widgetTitle = `${ title } (${ articleLengthText })`;
    }

    public onDestroy(): void {
        this.context.unregisterListener('communication-widget');
    }

    public async readAll(): Promise<void> {
        if (this.state.activeUnreadAction && this.context.getObjectId()) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, {loading: true, hint: 'Translatable#Loading ...'}
            );

            await TicketService.getInstance().markTicketAsSeen(Number(this.context.getObjectId()));

            // FIXME: reload list (Ticket.Article.Flag updates are filtered from notification events)
            this.state.articles = [];
            await this.context.reloadObjectList(KIXObjectType.ARTICLE);

            setTimeout(() => {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING, {loading: false, hint: ''}
                );
                BrowserUtil.openSuccessOverlay('Translatable#Marked all articles as read.');
            }, 50);
        }
    }
}

module.exports = Component;
