/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { BrowserUtil } from '../../../../base-components/webapp/core/BrowserUtil';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TicketDetailsContext, TicketService } from '../../core';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { BackendNotification } from '../../../../../model/BackendNotification';
import { TicketUIEvent } from '../../../model/TicketUIEvent';
import { TicketCommunicationConfiguration } from '../../../model/TicketCommunicationConfiguration';
import { Ticket } from '../../../model/Ticket';
import { SortUtil } from '../../../../../model/SortUtil';
import { SortOrder } from '../../../../../model/SortOrder';
import { ArticleFilter } from '../../core/context/ArticleFilter';
import { ArticleLoader } from '../../core/context/ArticleLoader';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private readonly displayView = 'selectedListView';
    private context: TicketDetailsContext;
    private sortOrder: string;
    private subscriber: IEventSubscriber;
    private communicationConfig: TicketCommunicationConfiguration;
    private articleIds: number[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);
        this.communicationConfig = this.state.widgetConfiguration?.configuration as TicketCommunicationConfiguration;

        this.state.informationConfig = this.communicationConfig?.articleInformationConfiguration;

        const user = await AgentService.getInstance().getCurrentUser();

        const articlePreference = user?.Preferences ? user.Preferences.find(
            (p) => p.ID === PersonalSettingsProperty.ARTICLE_SORT_ORDER
        ) : null;
        this.sortOrder = articlePreference?.Value;

        const listViewPreference = user?.Preferences ? user.Preferences.find(
            (p) => p.ID === PersonalSettingsProperty.MESSAGE_COMPACT_VIEW
        ) : null;
        this.state.selectedCompactView = !listViewPreference?.Value || listViewPreference?.Value === 'Compact';

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Go to top', 'Translatable#Read all', 'Translatable#Collapse all',
            'Translatable#Preview List', 'Translatable#Compact View', 'Translatable#Change sort direction'
        ]);

        await this.setArticleIDs();

        this.prepareFilter();
        this.initListener();
    }

    private prepareFilter(): void {
        const filterComponent = (this as any).getComponent('article-filter');
        if (filterComponent) {
            filterComponent.filter = async (): Promise<void> => {
                const articleFilter = new ArticleFilter();
                articleFilter.filterAttachments = filterComponent?.state?.filterAttachment;
                articleFilter.filterExternal = filterComponent?.state?.filterExternal;
                articleFilter.filterInternal = filterComponent?.state?.filterInternal;
                articleFilter.filterCustomer = filterComponent?.state?.filterCustomer;
                articleFilter.filterUnread = filterComponent?.state?.filterUnread;
                articleFilter.filterMyArticles = filterComponent?.state?.myArticles;
                articleFilter.fulltext = filterComponent?.state?.filterValue;
                articleFilter.filterDateBefore = filterComponent?.state?.isFilterDateBefore;
                articleFilter.filterDate = filterComponent?.state?.selectedDate;

                const result = await ArticleLoader.searchArticles(
                    Number(this.context?.getObjectId()), articleFilter
                );

                this.state.articleIds = Array.isArray(result) ? result : this.articleIds;
            };
        }
    }

    private initListener(): void {
        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('communication-widget'),
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === ApplicationEvent.OBJECT_DELETED) {
                    this.handleObjectDeleted(data);
                } else if (eventId === TicketUIEvent.SCROLL_TO_ARTICLE) {
                    this.handleScrollToArticle(data);
                }
            }
        };
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_DELETED, this.subscriber);
        EventService.getInstance().subscribe(TicketUIEvent.SCROLL_TO_ARTICLE, this.subscriber);

        setTimeout(() => {
            this.context.registerListener('communication-widget', {
                filteredObjectListChanged: (objectType: KIXObjectType) => {
                    if (objectType === KIXObjectType.ARTICLE) {
                        this.setArticleIDs();
                    }
                },
                objectListChanged: (objectType: KIXObjectType) => null,
                additionalInformationChanged: () => null,
                objectChanged: () => null,
                scrollInformationChanged: () => null,
                sidebarLeftToggled: () => null,
                sidebarRightToggled: () => null
            });
        }, 1000);
    }

    public onDestroy(): void {
        this.context.unregisterListener('communication-widget');
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_DELETED, this.subscriber);
        EventService.getInstance().unsubscribe(TicketUIEvent.SCROLL_TO_ARTICLE, this.subscriber);
    }

    private async setArticleIDs(): Promise<void> {
        const ticket = await this.context?.getObject<Ticket>(KIXObjectType.TICKET);
        let articleIds = ticket?.ArticleIDs || [];
        const sortOrder = this.sortOrder === 'newest' ? SortOrder.DOWN : SortOrder.UP;
        articleIds = articleIds.sort((a, b) => SortUtil.compareNumber(a, b, sortOrder));
        this.articleIds = articleIds;
        this.state.articleIds = articleIds;

        const title = await TranslationService.translate(this.state.widgetConfiguration?.title);
        this.state.widgetTitle = `${title} (${this.state.articleIds?.length})`;
    }

    private handleObjectDeleted(data: BackendNotification): void {
        const isArticleDelete = data?.Event === 'DELETE' && data?.Namespace === 'Ticket.Article';
        if (isArticleDelete) {
            const objectIds = data?.ObjectID?.split('::');
            if (objectIds?.length === 2) {
                const articleIndex = this.state.articleIds.findIndex((a) => a.toString() === objectIds[1].toString());
                if (articleIndex !== -1) {
                    this.state.articleIds.splice(articleIndex, 1);
                    (this as any).setStateDirty('articleIds');
                }
            }
        }
    }

    private handleScrollToArticle(data: any): void {
        if (!isNaN(Number(data.articleId))) {
            const component = (this as any).getComponent('article-' + Number(data.articleId));
            if (component) {
                component.scrollToArticle();
                component.toggleArticleCompactView(true);
            }
        }
    }

    public async readAll(): Promise<void> {
        if (this.state.activeUnreadAction && this.context.getObjectId()) {
            EventService.getInstance().publish(
                ApplicationEvent.APP_LOADING, { loading: true, hint: 'Translatable#Loading ...' }
            );

            await TicketService.getInstance().markTicketAsSeen(Number(this.context.getObjectId()));

            setTimeout(() => {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
                );
                BrowserUtil.openSuccessOverlay('Translatable#Marked all articles as read.');
            }, 50);
        }
    }

    public selectNormalDisplay(): void {
        AgentService.getInstance().setPreferences([[PersonalSettingsProperty.MESSAGE_COMPACT_VIEW, 'List']]);
        this.state.selectedCompactView = false;
    }

    public selectListDisplay(): void {
        AgentService.getInstance().setPreferences([[PersonalSettingsProperty.MESSAGE_COMPACT_VIEW, 'Compact']]);
        this.state.selectedCompactView = true;
    }

    public collapseAll(): void {
        for (const articleId of this.state.articleIds) {
            EventService.getInstance().publish('TOGGLE_ARTICLE', { articleId, expanded: false });
        }
    }

    public scrollToTop(event: any): void {
        event.stopPropagation();
        event.preventDefault();

        const element: HTMLElement = document.getElementById('communication-top');
        if (element) {
            element.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'smooth' });
        }
    }

    public changeSortDirection(): void {
        if (this.sortOrder === 'newest') {
            this.sortOrder = 'odlest';
        } else {
            this.sortOrder = 'newest';
        }
        AgentService.getInstance().setPreferences([[PersonalSettingsProperty.ARTICLE_SORT_ORDER, this.sortOrder]]);
        this.state.articleIds = this.state.articleIds.reverse();
        (this as any).setStateDirty('articleIds');
    }

    public getArticleCountNumber(articleId: number): number {
        let index = this.state.articleIds.findIndex((aid) => aid === articleId) + 1;
        if (this.sortOrder === 'newest') {
            index = this.state.articleIds.length - index;
        }
        return index;
    }
}

module.exports = Component;
