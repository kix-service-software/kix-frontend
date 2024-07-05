/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../../model/IdService';
import { Attachment } from '../../../../../../model/kix/Attachment';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { BrowserUtil } from '../../../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { DisplayImageDescription } from '../../../../../base-components/webapp/core/DisplayImageDescription';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { IContextListener } from '../../../../../base-components/webapp/core/IContextListener';
import { IEventSubscriber } from '../../../../../base-components/webapp/core/IEventSubscriber';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { Article } from '../../../../model/Article';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { TicketDetailsContext, TicketService } from '../../../core';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: TicketDetailsContext;
    private eventSubscriber: IEventSubscriber;
    private contextListener: IContextListener;
    private contextListenerId: string;
    private articleId: number;
    private article: Article;
    private articleLoaded: boolean = false;
    private articleIndex: number;

    private observer: IntersectionObserver;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.update(input);
        this.articleIndex = input.articleIndex;
    }

    private async update(input: any): Promise<void> {
        this.articleId = input.articleId;
        this.state.selectedCompactView = typeof input.selectedCompactView !== 'undefined' ? input.selectedCompactView : true;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext<TicketDetailsContext>();
        this.prepareObserver();

        this.state.switchAttachmentListTooltip = await TranslationService.translate('Translatable#Switch attachment list layout');

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
                this.loadArticle();
            } else if (entry.intersectionRatio === 0) {
                this.context?.articleLoader?.dequeueArticle(this.articleId);
            }
        });
    }

    private async loadArticle(): Promise<void> {
        if (!this.articleLoaded) {
            this.context?.articleLoader?.queueArticle(this.articleId, async (a: Article) => {
                const countNumber = this.articleId;
                this.state.article = a;
                this.state.article['countNumber'] = countNumber;
                this.articleLoaded = true;

                if (this.articleIndex === 0) {
                    this.toggleArticleCompactView(true);
                }

                this.state.unseen = this.state.article?.Unseen;

                this.state.actions = await this.context?.articleLoader?.prepareArticleActions(this.state.article);
                this.prepareAttachments();
                if (!this.state.selectedCompactView) {
                    await this.prepareImages();
                }

                await this.prepareArticleData();

                this.observer?.disconnect();

                this.state.show = true;
            });
        }
    }

    public scrollToArticle(): void {
        const element: any = (this as any).getEl();
        if (element) {
            BrowserUtil.scrollIntoViewIfNeeded(element);
        }
    }

    private async prepareArticleData(): Promise<void> {
        this.state.isExternal = this.state.article?.SenderType === 'external';

        const contact = await this.context?.articleLoader?.getContactForArticle(this.state.article);
        if (contact) {
            this.state.contactIcon = LabelService.getInstance().getObjectIcon(contact);

            if (!this.state.isExternal) {
                this.state.fromDisplayName = await LabelService.getInstance().getObjectText(contact, false, true);
            }
        }

        if (!this.state.contactIcon) {
            this.state.contactIcon = LabelService.getInstance().getObjectIconForType(KIXObjectType.CONTACT);
        }

        this.state.shortMessage = this.state.article?.Body?.substring(0, 255);
        if (this.state.article?.Body?.length > 255) {
            this.state.shortMessage += '...';
        }

        this.state.backgroundColor = await this.context?.articleLoader?.getChannelColor(this.state.article?.Channel);

        this.eventSubscriber = {
            eventSubscriberId: 'message-content-' + this.articleId,
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === 'TOGGLE_ARTICLE' && data.articleId === this.articleId) {
                    this.state.expanded = data.expanded;
                    this.state.compactViewExpanded = this.state.selectedCompactView ? this.state.expanded : false;
                    this.toggleArticleContent();
                }
            }
        };
        EventService.getInstance().subscribe('TOGGLE_ARTICLE', this.eventSubscriber);
    }

    private filterAttachments(): void {
        this.state.articleAttachments = this.context?.articleLoader?.filterAttachments(
            this.state.article, this.state.showAllAttachments
        );
    }

    public toggleArticleListView(event?: any): void {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }
        this.state.expanded = !this.state.expanded;
        this.toggleArticleContent();
    }

    public async toggleArticleCompactView(forceOpen?: boolean): Promise<void> {
        if (forceOpen) {
            this.state.compactViewExpanded = true;
            this.state.expanded = this.state.compactViewExpanded;
            this.toggleArticleContent();
        } else if (!await BrowserUtil.isTextSelected() && this.state.selectedCompactView) {
            this.state.compactViewExpanded = !this.state.compactViewExpanded;
            this.state.expanded = this.state.compactViewExpanded;
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
                this.state.article, ArticleProperty.CC, undefined, false, false
            );

            await this.setArticleSeen(undefined, true);

            this.state.unseen = 0;

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
        const imageAttachments = this.state.articleAttachments.filter((a) => a.ContentType.match(/^image\//));
        let images: DisplayImageDescription[] = [];

        if (imageAttachments?.length) {
            const attachments = await TicketService.getInstance().loadArticleAttachments(
                this.state.article.TicketID, this.state.article.ArticleID, imageAttachments.map((a) => a.ID)
            ).catch((): Attachment[] => []);

            if (attachments?.length) {
                for (const attachment of attachments) {
                    const content = `data:${attachment.ContentType};base64,${attachment.Content}`;
                    const displayImage = new DisplayImageDescription(
                        attachment.ID, content, attachment.Comment ? attachment.Comment : attachment.Filename
                    );
                    images.push(displayImage);
                }
            }
        }
        this.state.images = images;
    }

    private async setArticleSeen(
        article: Article = this.state.article || this.article, silent?: boolean
    ): Promise<void> {
        if (article?.isUnread()) {
            await TicketService.getInstance().setArticleSeenFlag(
                article.TicketID, article.ArticleID
            );
            this.context.reloadObjectList(KIXObjectType.ARTICLE, true);
        }
    }

    public toggleAttachments(e: any): void {
        e.stopPropagation();
        this.state.showAllAttachments = !this.state.showAllAttachments;
        this.filterAttachments();
    }

    public async switchAttachmentLayout(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();
        this.state.oneColumnLayout = !this.state.oneColumnLayout;
    }

}

module.exports = Component;
