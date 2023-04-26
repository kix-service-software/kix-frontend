/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { IdService } from '../../../../../model/IdService';
import { BackendNotification } from '../../../../../model/BackendNotification';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private readonly displayView = 'selectedListView';
    private context: Context;
    private sortOrder: string;
    private loadTimeout: any;
    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        const user = await AgentService.getInstance().getCurrentUser();

        const articlePreference = user?.Preferences ? user.Preferences.find(
            (p) => p.ID === PersonalSettingsProperty.ARTICLE_SORT_ORDER
        ) : null;
        this.sortOrder = articlePreference?.Value;

        const listViewPreference = user?.Preferences ? user.Preferences.find(
            (p) => p.ID === PersonalSettingsProperty.MESSAGE_COMPACT_VIEW
        ) : null;
        this.state.selectedCompactView = !listViewPreference?.Value || listViewPreference?.Value === 'Compact';

        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Go to top', 'Translatable#Read all', 'Translatable#Collapse all',
                'Translatable#Preview List', 'Translatable#Compact View', 'Translatable#Change sort direction']);

        if (!this.state.articles?.length) {
            await this.loadFilteredArticles();
        }

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('communication-widget'),
            eventPublished: (data: BackendNotification, eventId: string): void => {
                const isArticleDelete = data.Event === 'DELETE' && data.Namespace === 'Ticket.Article';
                if (isArticleDelete) {
                    const objectIds = data.ObjectID?.split('::');
                    if (objectIds?.length === 2) {
                        const hasArticle = this.state.articles.some((a) => a.ArticleID.toString() === objectIds[1]);
                        if (hasArticle) {
                            this.loadFilteredArticles();
                        }
                    }
                }
            }
        };
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_DELETED, this.subscriber);

        setTimeout(() => {
            this.context.registerListener('communication-widget', {
                filteredObjectListChanged: (objectType: KIXObjectType) => {
                    if (objectType === KIXObjectType.ARTICLE) {
                        this.setFilteredArticles();
                    }
                },
                objectListChanged: (objectType: KIXObjectType) => {
                    // if (objectType === KIXObjectType.ARTICLE) {
                    //     this.setFilteredArticles();
                    // }
                },
                additionalInformationChanged: () => null,
                objectChanged: () => null,
                scrollInformationChanged: () => null,
                sidebarLeftToggled: () => null,
                sidebarRightToggled: () => null
            });
        }, 1000);
    }

    private async enableReadAction(): Promise<void> {
        // enable read action
        const allArticles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];
        if (allArticles.length) {
            this.state.activeUnreadAction = allArticles.some((a) => a.isUnread());
        }
    }

    private async setFilteredArticles(): Promise<void> {
        if (this.loadTimeout) {
            window.clearTimeout(this.loadTimeout);
        }

        this.loadTimeout = setTimeout(() => this.loadFilteredArticles(), 250);
    }

    private async loadFilteredArticles(): Promise<void> {
        let articles = await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || [];
        const filteredArticles = this.context.getFilteredObjectList<Article>(KIXObjectType.ARTICLE) || articles;

        const sortOrder = this.sortOrder === 'newest' ? SortOrder.DOWN : SortOrder.UP;

        articles = SortUtil.sortObjects(
            [...articles], ArticleProperty.INCOMING_TIME, DataType.INTEGER, sortOrder
        );

        articles.forEach((a, index) => {
            a['countNumber'] = sortOrder === SortOrder.UP
                ? index + 1
                : articles.length - index;
        });

        this.state.articles = articles.filter((a) => filteredArticles.find((fa) => a.ArticleID === fa.ArticleID));

        this.enableReadAction();

        // change widget title
        const preCountText = (filteredArticles?.length < articles?.length ? filteredArticles.length + '/' : '');
        const articleLengthText = preCountText + articles?.length;

        const title = await TranslationService.translate(this.state.widgetConfiguration?.title);
        this.state.widgetTitle = `${title} (${articleLengthText})`;

        if (this.state.articles?.length) {
            setTimeout(() => {
                EventService.getInstance().publish(
                    'TOGGLE_ARTICLE', { articleId: this.state.articles[0].ArticleID, expanded: true }
                );
            }, 10);
        }
    }

    public onDestroy(): void {
        this.context.unregisterListener('communication-widget');
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_DELETED, this.subscriber);
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
            await this.loadFilteredArticles();

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
        for (const article of this.state.articles) {
            EventService.getInstance().publish(
                'TOGGLE_ARTICLE', { articleId: article.ArticleID, expanded: false }
            );
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
        if (this.sortOrder === 'newest') this.sortOrder = 'odlest';
        else this.sortOrder = 'newest';
        AgentService.getInstance().setPreferences([[PersonalSettingsProperty.ARTICLE_SORT_ORDER, this.sortOrder]]);
        this.loadFilteredArticles();
    }
}

module.exports = Component;
