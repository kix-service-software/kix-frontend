/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { IdService } from '../../../../../../model/IdService';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { SortUtil } from '../../../../../../model/SortUtil';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ActionFactory } from '../../../../../base-components/webapp/core/ActionFactory';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { DisplayImageDescription } from '../../../../../base-components/webapp/core/DisplayImageDescription';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IContextListener } from '../../../../../base-components/webapp/core/IContextListener';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { KIXModulesService } from '../../../../../base-components/webapp/core/KIXModulesService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { TicketService } from '../../../core';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private eventSubscriber: IEventSubscriber;
    private contextListener: IContextListener;
    private contextListenerId: string;
    private article: Article;
    private articleLoaded: boolean = false;

    private observer: IntersectionObserver;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.update(input);
    }

    private async update(input: any): Promise<void> {
        const oldChangeTime = this.article?.ChangeTime;
        const currChangeTime = input.article?.ChangeTime;
        this.article = input.article;

        // on update, some article was already loaded
        if (this.state.article && this.state.article.ArticleID !== this.article.ArticleID) {
            await this.loadArticle(undefined, true);
        } else if (oldChangeTime !== currChangeTime) {
            this.state.article = this.article;
            this.prepareArticleData();
        }

        if (input.collapseAll) {
            this.state.expanded = false;
        } else if (input.expanded && !this.state.expanded) {
            // expand if now necessary
            this.toggleArticleListView();
        }
        this.state.selectedCompactView = typeof input.selectedCompactView !== 'undefined' ? input.selectedCompactView : true;
        this.state.compactViewExpanded = this.state.selectedCompactView ? this.state.expanded : false;

        // load article and prepare actions if not done yet
        if (!this.state.article['ObjectActions']?.length) {
            this.loadArticle(undefined, true);
        }
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();
        this.prepareObserver();

        this.contextListenerId = IdService.generateDateBasedId('message-content-' + this.article?.ArticleID);
        this.contextListener = {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectChanged: (): void => { return; },
            objectListChanged: (): void => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: (objectType: KIXObjectType | string, objectId: string | number): void => {
                if (
                    objectType === KIXObjectType.ARTICLE &&
                    this.article?.ArticleID.toString() === objectId.toString()
                ) {
                    this.scrollToArticle();
                }
            },
            additionalInformationChanged: (): void => { return; }
        };
        this.context.registerListener(this.contextListenerId, this.contextListener);
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe('TOGGLE_ARTICLE', this.eventSubscriber);

        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.context && this.contextListenerId) {
            this.context.unregisterListener(this.contextListenerId);
        }
    }

    private prepareObserver(): void {
        if (!this.state.show && this.supportsIntersectionObserver()) {
            const row = (this as any).getEl();
            if (row) {
                if (this.observer) {
                    this.observer.disconnect();
                }
                this.observer = new IntersectionObserver(this.intersectionCallback.bind(this));
                this.observer.observe(row);
            }
        } else {
            this.loadArticle();
        }
    }

    private supportsIntersectionObserver(): boolean {
        return 'IntersectionObserver' in global
            && 'IntersectionObserverEntry' in global
            && 'intersectionRatio' in IntersectionObserverEntry.prototype;
    }

    private intersectionCallback(entries, observer): void {
        entries.forEach(async (entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                await this.loadArticle();
                if (this.state.expanded) {
                    this.toggleArticleContent();
                }
                this.observer.disconnect();
            }
        });
    }

    private scrollToArticle(): void {
        const element: any = (this as any).getEl();
        if (element) {
            BrowserUtil.scrollIntoViewIfNeeded(element);
        }
    }

    private async prepareActions(): Promise<void> {
        if (!this.context) {
            this.context = ContextService.getInstance().getActiveContext();
        }
        const actions = await this.context.getAdditionalActions(this.state.article) || [];

        const hasKIXPro = await KIXModulesService.getInstance().hasPlugin('KIXPro');
        if (!hasKIXPro) {
            const startActions = ['article-reply-action', 'article-forward-action'];
            const actionInstance = await ActionFactory.getInstance().generateActions(
                startActions, this.state.article
            );
            actions.push(...actionInstance);
        }

        const plainTextAction = await ActionFactory.getInstance().generateActions(['article-get-plain-action'], this.state.article);
        if (plainTextAction?.length) {
            plainTextAction[0].setData(this.state.article);
            actions.push(...plainTextAction);
        }

        const printAction = await ActionFactory.getInstance().generateActions(['article-print-action'], this.state.article);
        if (printAction?.length) {
            printAction[0].setData(this.state.article);
            actions.push(...printAction);
        }

        const filteredActions = [];
        for (const a of actions) {
            if (await a.canShow()) {
                filteredActions.push(a);
            }
        }
        this.state.actions = filteredActions;
    }

    private async prepareArticleData(): Promise<void> {
        this.state.isExternal = this.state.article?.SenderType === 'external';

        const contact = await TicketService.getContactForArticle(this.state.article);
        if (contact) {
            this.state.contactIcon = LabelService.getInstance().getObjectIcon(contact);

            if (!this.state.isExternal) {
                this.state.fromDisplayName = await LabelService.getInstance().getObjectText(contact, false, true);
            }
        } else {
            this.state.contactIcon = LabelService.getInstance().getObjectIconForType(KIXObjectType.CONTACT);
        }

        this.state.shortMessage = this.state.article?.Body?.substring(0, 255);
        if (this.state.article?.Body?.length > 255) {
            this.state.shortMessage += '...';
        }

        if (this.state.article) {
            this.state.backgroundColor = await TicketService.getInstance().getChannelColor(this.state.article.Channel);
        }

        this.eventSubscriber = {
            eventSubscriberId: 'message-content-' + this.state.article?.ArticleID,
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === 'TOGGLE_ARTICLE') {
                    this.state.expanded = data;
                    if (this.state.expanded) {
                        this.setArticleSeen();
                    }
                }
            }
        };
        EventService.getInstance().subscribe('TOGGLE_ARTICLE', this.eventSubscriber);
    }

    private filterAttachments(): void {
        let attachments = (this.state.article?.Attachments || []);

        attachments = attachments.filter(
            (a) => !a.Filename.match(/^file-(1|2)$/) &&
                (this.state.showAllAttachments || a.Disposition !== 'inline')
        );

        attachments.sort((a, b) => {
            if (!this.state.showAllAttachments) return SortUtil.compareString(a.Filename, b.Filename);

            let result = -1;
            if (a.Disposition === b.Disposition) {
                result = SortUtil.compareString(a.Filename, b.Filename);
            } else if (a.Disposition === 'inline') {
                result = 1;
            }
            return result;
        });
        this.state.articleAttachments = attachments;
    }

    public toggleArticleListView(event?: any): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.state.expanded = !this.state.expanded;
        this.toggleArticleContent();
    }

    public async toggleArticleCompactView(): Promise<void> {
        if (!await BrowserUtil.isTextSelected() && this.state.selectedCompactView) {
            this.state.compactViewExpanded = !this.state.compactViewExpanded;
            this.state.expanded = this.state.compactViewExpanded;
            await this.loadArticle();
            this.toggleArticleContent();
        }
    }

    private async toggleArticleContent(): Promise<void> {
        if (this.state.expanded) {
            this.state.loadingContent = true;

            this.prepareAttachments();

            if (this.state.compactViewExpanded) {
                await this.prepareImages();
            }

            this.state.articleTo = await LabelService.getInstance().getDisplayText(
                this.state.article, ArticleProperty.TO, undefined, undefined, false
            );
            this.state.articleCc = await LabelService.getInstance().getDisplayText(
                this.state.article, ArticleProperty.CC, undefined, undefined, false
            );

            await this.setArticleSeen(undefined, true);

            this.state.loadingContent = false;
            this.state.showContent = true;
        }
    }

    private prepareAttachments(): void {
        if (!this.state.selectedCompactView || this.state.compactViewExpanded) {
            this.filterAttachments();

            const attachments = this.state.article?.Attachments || [];
            this.state.hasInlineAttachments = attachments.some((a) => a.Disposition === 'inline' && a.ContentID);
        }
    }

    private async prepareImages(): Promise<void> {
        const attachmentPromises: Array<Promise<DisplayImageDescription>> = [];
        const imageAttachments = this.state.articleAttachments.filter((a) => a.ContentType.match(/^image\//));
        if (imageAttachments && imageAttachments.length) {
            for (const imageAttachment of imageAttachments) {
                attachmentPromises.push(new Promise<DisplayImageDescription>(async (resolve, reject) => {
                    const attachment = await TicketService.getInstance().loadArticleAttachment(
                        this.state.article.TicketID, this.state.article.ArticleID, imageAttachment.ID
                    ).catch(() => null);

                    if (attachment) {
                        const content = `data:${attachment.ContentType};base64,${attachment.Content}`;
                        resolve(new DisplayImageDescription(
                            attachment.ID, content, attachment.Comment ? attachment.Comment : attachment.Filename
                        ));
                    } else {
                        resolve(null);
                    }
                }));
            }
        }
        this.state.images = (await Promise.all(attachmentPromises)).filter((i) => i);
    }

    private async setArticleSeen(
        article: Article = this.state.article || this.article, silent?: boolean
    ): Promise<void> {
        if (article?.isUnread()) {
            await TicketService.getInstance().setArticleSeenFlag(
                article.TicketID, article.ArticleID
            );
            this.context.reloadObjectList(KIXObjectType.ARTICLE);
        }
    }

    public toggleAttachments(e: any): void {
        e.stopPropagation();
        this.state.showAllAttachments = !this.state.showAllAttachments;
        this.filterAttachments();
    }

    private async loadArticle(silent: boolean = false, force?: boolean): Promise<void> {
        this.state.loading = !silent;

        if (!this.articleLoaded || force) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [
                    ArticleProperty.PLAIN, ArticleProperty.ATTACHMENTS, 'ObjectActions'
                ]
            );
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [this.article.ArticleID], loadingOptions,
                new ArticleLoadingOptions(this.article.TicketID)
            );

            if (articles?.length) {
                this.state.article = articles[0];
                this.articleLoaded = true;
            }
        }

        await this.prepareActions();
        this.prepareAttachments();
        if (!this.state.selectedCompactView) {
            await this.prepareImages();
        }

        await this.prepareArticleData();

        this.state.loading = false;
        this.state.show = true;
    }
}

module.exports = Component;
