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

        this.initListener();

        await this.setArticleIDs();
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

        this.context.registerListener('communication-widget', {
            filteredObjectListChanged: (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.ARTICLE) {
                    this.setArticleIDs();
                }
            },
            objectListChanged: (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.ARTICLE) {
                    this.articleIds = null;
                    this.setArticleIDs();
                }
            },
            additionalInformationChanged: () => null,
            objectChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null
        });
    }

    public onDestroy(): void {
        this.context.unregisterListener('communication-widget');
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_DELETED, this.subscriber);

        EventService.getInstance().unsubscribe(TicketUIEvent.SCROLL_TO_ARTICLE, this.subscriber);
    }

    private async setArticleIDs(): Promise<void> {
        if (!this.articleIds) {
            const ticket = await this.context?.getObject<Ticket>(KIXObjectType.TICKET);
            this.state.activeUnreadAction = Number(ticket?.Unseen) === 1;
            this.articleIds = ticket?.ArticleIDs || [];
        }

        const filterComponent = (this as any).getComponent('article-filter');
        if (filterComponent && filterComponent.isFiltered) {
            const articles: Article[] = this.context?.getFilteredObjectList(KIXObjectType.ARTICLE) || [];
            this.state.articleIds = articles.map((a) => a.ArticleID);
        } else {
            this.state.articleIds = [...this.articleIds];
        }

        if (this.sortOrder === 'newest') {
            this.state.articleIds = this.state.articleIds.reverse();
        }

        const title = await TranslationService.translate(this.state.widgetConfiguration?.title);
        let allCountString = '';
        if (this.state.articleIds && this.articleIds && this.state.articleIds.length < this.articleIds.length) {
            allCountString = '/' + this.articleIds.length;
        }
        this.state.widgetTitle = `${title} (${this.state.articleIds.length}${allCountString})`;
    }

    private handleObjectDeleted(data: BackendNotification): void {
        const isArticleDelete = data?.Event === 'DELETE' &&
            (data?.Namespace === 'Ticket.Article' || data?.Namespace === 'Ticket.Article.Plain');
        if (isArticleDelete) {
            const objectIds = data?.ObjectID?.split('::');
            if (objectIds?.length === 2) {
                const allArticleIndex = this.articleIds.findIndex((a) => a.toString() === objectIds[1].toString());
                if (allArticleIndex !== -1) {
                    this.articleIds.splice(allArticleIndex, 1);
                    this.setArticleIDs();
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
            await this.setArticleIDs();

            setTimeout(() => {
                EventService.getInstance().publish(
                    ApplicationEvent.APP_LOADING, { loading: false, hint: '' }
                );
                BrowserUtil.openSuccessOverlay('Translatable#Marked all articles as read.');

                EventService.getInstance().publish(ApplicationEvent.REFRESH_CONTENT);
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

    public expandAll(): void {
        for (const articleId of this.state.articleIds) {
            EventService.getInstance().publish('TOGGLE_ARTICLE', { articleId, expanded: true });
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
        return this.articleIds.findIndex((aid) => aid === articleId) + 1;
    }
}

module.exports = Component;
