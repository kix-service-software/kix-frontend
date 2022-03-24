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
            objectListChanged: (objectType: KIXObjectType) => null,
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

        this.setFilteredArticles();

        // enable read action
        const allArticles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];
        if (allArticles.length) {
            this.state.activeUnreadAction = allArticles.some((a) => a.isUnread());

        }
    }

    private async setFilteredArticles(): Promise<void> {
        const articles = this.context.getFilteredObjectList<Article>(KIXObjectType.ARTICLE) || [];

        this.state.articles = SortUtil.sortObjects(
            [...articles], ArticleProperty.INCOMING_TIME, DataType.INTEGER,
            this.sortOrder === 'newest' ? SortOrder.DOWN : SortOrder.UP
        );

        // change widget title
        const allArticles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];
        this.state.widgetTitle = this.state.widgetConfiguration?.title +
            ` (${articles?.length < allArticles?.length ? articles.length + '/' : ''}${allArticles?.length})`;
    }

    public onDestroy(): void {
        this.context.unregisterListener('communication-widget');
    }

    public toggleAll(): void {
        this.state.expanded = !this.state.expanded;
        EventService.getInstance().publish('TOGGLE_ARTICLE', this.state.expanded);
    }

    public async readAll(): Promise<void> {
        if (this.state.activeUnreadAction) {
            EventService.getInstance().publish('READ_ALL_ARTICLES');

            // show loading as visual effect ... something is done ;)
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Loading ...' }
            );
            setTimeout(() => {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
                );
                BrowserUtil.openSuccessOverlay('Translatable#Marked all articles as read.');
                this.state.activeUnreadAction = false;
            }, 1000);
        }
    }
}

module.exports = Component;