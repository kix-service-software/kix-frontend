/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ComponentState } from './ComponentState';
import { Context } from '../../../../../model/Context';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Article } from '../../../model/Article';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { AgentService } from '../../../../user/webapp/core/AgentService';
import { PersonalSettingsProperty } from '../../../../user/model/PersonalSettingsProperty';
import { SortUtil } from '../../../../../model/SortUtil';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { DataType } from '../../../../../model/DataType';
import { SortOrder } from '../../../../../model/SortOrder';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TicketService } from '../../core';

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
            filteredObjectListChanged: (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.ARTICLE) {
                    this.setFilteredArticles();
                }
            },
            objectListChanged: (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.ARTICLE) {
                    this.setArticles();
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

        // enable read action if necessary
        this.enableReadAction();
    }

    private async setArticles(): Promise<void> {
        this.setFilteredArticles();
        this.enableReadAction();
    }

    private async enableReadAction(): Promise<void> {
        const allArticles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];
        if (allArticles.length) {
            this.state.activeUnreadAction = allArticles.some((a) => a.isUnread());
        }
    }

    private async setFilteredArticles(): Promise<void> {
        const filteredArticles = this.context.getFilteredObjectList<Article>(KIXObjectType.ARTICLE) || [];

        const sortOrder = this.sortOrder === 'newest' ? SortOrder.DOWN : SortOrder.UP;

        let allArticles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];

        allArticles = SortUtil.sortObjects(
            [...allArticles], ArticleProperty.INCOMING_TIME, DataType.INTEGER, sortOrder
        );

        allArticles.forEach((a, index) => {
            a['countNumber'] = sortOrder === SortOrder.UP ? index + 1 : allArticles.length - index;
        });

        this.state.articles = allArticles.filter((a) => filteredArticles.find((fa) => a.ArticleID === fa.ArticleID));

        // change widget title
        const articleLengthText = (filteredArticles?.length < allArticles?.length ? filteredArticles.length +
            '/' : '') + allArticles?.length;
        const title = await TranslationService.translate(this.state.widgetConfiguration?.title);
        this.state.widgetTitle = `${title} (${articleLengthText})`;
    }

    public onDestroy(): void {
        this.context.unregisterListener('communication-widget');
    }

    public async readAll(): Promise<void> {
        if (this.state.activeUnreadAction && this.context.getObjectId()) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Loading ...' }
            );

            await TicketService.getInstance().markTicketAsSeen(Number(this.context.getObjectId()));

            // FIXME: reload list (Ticket.Article.Flag updates are filtered from notification events)
            this.state.articles = [];
            await this.context.reloadObjectList(KIXObjectType.ARTICLE);

            setTimeout(() => {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
                );
                BrowserUtil.openSuccessOverlay('Translatable#Marked all articles as read.');
            }, 50);
        }
    }
}

module.exports = Component;
