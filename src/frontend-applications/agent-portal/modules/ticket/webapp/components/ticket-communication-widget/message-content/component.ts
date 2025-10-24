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
import { DisplayImageDescription } from '../../../../../base-components/webapp/core/DisplayImageDescription';
import { IContextListener } from '../../../../../base-components/webapp/core/IContextListener';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { Article } from '../../../../model/Article';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { TicketEvent } from '../../../../model/TicketEvent';
import { TicketDetailsContext, TicketService } from '../../../core';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState, TicketDetailsContext> {

    private contextListener: IContextListener;
    private contextListenerId: string;
    private articleId: number;
    private articleLoaded: boolean = false;
    private articleIndex: number;
    private detailedArticle: Article;
    private elementInterval: any = null;

    private observer: IntersectionObserver;
    private resizeObserver: ResizeObserver;

    public onCreate(input: any): void {
        super.onCreate(input, 'ticket-communication-widget/message-content');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.update(input);
        this.articleIndex = input.articleIndex;
    }

    private async update(input: any): Promise<void> {
        this.articleId = input.articleId;
        this.state.informationConfig = input.informationConfig;
        this.state.selectedCompactView = typeof input.selectedCompactView !== 'undefined' ? input.selectedCompactView : true;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.expanded = this.getArticleToggleState();
        this.state.show = this.state.expanded;
        this.state.compactViewExpanded = this.state.selectedCompactView ? this.state.expanded : false;

        await this.prepareObserver();
        await this.toggleArticleContent(false);

        const focusedArticleId = this.context.getAdditionalInformation('CURRENT_ARTICLE_FOCUS');
        if (focusedArticleId === this.articleId) {
            setTimeout(() => this.scrollToArticle(), 500);
        }

        this.state.switchAttachmentListTooltip = await TranslationService.translate('Translatable#Switch attachment list layout');
        this.registerContextListener();
    }

    private registerContextListener(): void {
        this.contextListenerId = IdService.generateDateBasedId('message-content-' + this.articleId);
        this.contextListener = {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectChanged: (): void => { return; },
            objectListChanged: (): void => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: (objectType: KIXObjectType | string, objectId: string | number): void => {
                if (
                    objectType === KIXObjectType.ARTICLE &&
                    this.articleId.toString() === objectId.toString()
                ) {
                    this.scrollToArticle();
                }
            },
            additionalInformationChanged: (): void => { return; }
        };
        this.context?.registerListener(this.contextListenerId, this.contextListener);
    }

    public onDestroy(): void {
        super.onDestroy();

        if (this.elementInterval) {
            clearInterval(this.elementInterval);
        }

        if (this.observer) {
            this.observer.disconnect();
        }

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }

        if (this.context && this.contextListenerId) {
            this.context.unregisterListener(this.contextListenerId);
        }
    }

    private async prepareObserver(): Promise<void> {
        if (window.ResizeObserver) {
            this.resizeObserver = new ResizeObserver((entries) => {
                this.resizeHandling();
            });
            const rootElement = (this as any).getEl();
            this.resizeObserver.observe(rootElement);
        }

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
            await this.loadArticle();
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
                if (this.state.unseen) {
                    this.context.registerUnseenArticle(this.state.article.ArticleID);
                }
                await this.prepareArticleData();

                if (this.state.expanded) {
                    this.loadDetailedArticle();
                } else {
                    await this.prepareActions();
                }

                this.observer?.disconnect();
                this.state.show = true;
            });
        } else if (this.state.article) {
            await this.prepareActions();
        }

        this.resizeHandling();
    }

    private loadDetailedArticle(allowSetSeen: boolean = false): void {
        if (!this.detailedArticle) {
            this.context?.articleDetailsLoader?.queueArticle(this.articleId, (a: Article) => {
                this.detailedArticle = a;
                this.prepareArticleContent(allowSetSeen);
            });
        } else {
            this.prepareArticleContent(allowSetSeen);
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

        if (this.state.article.SMIMESigned) {
            const property = this.state.isExternal ? ArticleProperty.SMIME_VERIFIED : ArticleProperty.SMIME_SIGNED;
            this.state.smimeSignedTooltip = await LabelService.getInstance().getDisplayText(
                this.state.article, property
            );
            if (!this.state.article[property]) {
                this.state.smimeSignedTooltip += ` (${this.state.article.SMIMESignedError})`;
            }
            const icons = await LabelService.getInstance().getIcons(
                this.state.article, property
            );
            this.state.smimeSignedIcon = icons?.length ? icons[0] : null;
            this.state.smimeSigned = this.state.article[property];
        }

        super.registerEventSubscriber(
            async function (data: any, eventId: string): Promise<void> {
                if (eventId === 'TOGGLE_ARTICLE' && data.articleId === this.articleId) {
                    this.state.expanded = data.expanded;
                    this.state.compactViewExpanded = this.state.selectedCompactView ? this.state.expanded : false;
                    this.toggleArticleContent();
                }
                if (eventId === TicketEvent.MARK_TICKET_AS_SEEN && this.state.article.TicketID === data) {
                    this.state.unseen = 0;
                }
            },
            [
                'TOGGLE_ARTICLE',
                TicketEvent.MARK_TICKET_AS_SEEN
            ]
        );
    }

    private filterAttachments(): void {
        this.state.articleAttachments = this.detailedArticle?.getAttachments(
            this.state.showAllAttachments
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

    private async toggleArticleContent(setFocus: boolean = true): Promise<void> {
        if (this.state.expanded) {
            this.state.loadingContent = true;

            this.loadDetailedArticle(true);

            if (setFocus) {
                this.context.setAdditionalInformation('CURRENT_ARTICLE_FOCUS', this.articleId);
            }
        }

        this.saveArticleToggleState();
    }

    private async prepareArticleContent(allowSetSeen: boolean = false): Promise<void> {
        this.prepareAttachments();

        if (this.state.compactViewExpanded) {
            await this.prepareImages();
        }

        this.state.articleTo = await LabelService.getInstance().getDisplayText(
            this.detailedArticle, ArticleProperty.TO, undefined, undefined, false
        );
        this.state.articleCc = await LabelService.getInstance().getDisplayText(
            this.detailedArticle, ArticleProperty.CC, undefined, false, false
        );
        this.state.articleBcc = await LabelService.getInstance().getDisplayText(
            this.detailedArticle, ArticleProperty.BCC, undefined, false, false
        );

        if (allowSetSeen) {
            await this.setArticleSeen();
            this.state.unseen = 0;
        }

        this.state.loadingContent = false;
        this.state.showContent = true;

        await this.prepareActions(this.detailedArticle);
    }

    private async prepareActions(article: Article = this.state.article): Promise<void> {
        this.state.actions = await this.context?.articleLoader?.prepareArticleActions(article);
    }

    private saveArticleToggleState(): void {
        let toggleState: Map<number, boolean> = this.context.getAdditionalInformation('ARTICLE_TOGGLE_STATE');
        if (!toggleState) {
            toggleState = new Map();
        }

        if (this.articleId) {
            toggleState.set(this.articleId, this.state.expanded);
        }

        this.context.setAdditionalInformation('ARTICLE_TOGGLE_STATE', toggleState);
    }

    private getArticleToggleState(): boolean {
        let toggled: boolean = false;
        const toggleState: Map<number, boolean> = this.context.getAdditionalInformation('ARTICLE_TOGGLE_STATE');
        if (toggleState?.has(this.articleId)) {
            toggled = toggleState.get(this.articleId);
        }

        return toggled;
    }

    private prepareAttachments(): void {
        if (!this.state.selectedCompactView || this.state.compactViewExpanded) {
            this.filterAttachments();

            const attachments = this.detailedArticle?.getAttachments(true) || [];
            this.state.hasInlineAttachments = attachments.some((a) => a.Disposition === 'inline');
        }
    }

    private async prepareImages(): Promise<void> {
        const imageAttachments = this.state.articleAttachments.filter((a) => a.ContentType.match(/^image\//));
        let images: DisplayImageDescription[] = [];

        if (imageAttachments?.length) {
            const attachments = await TicketService.getInstance().loadArticleAttachments(
                this.detailedArticle?.TicketID, this.detailedArticle?.ArticleID, imageAttachments.map((a) => a.ID)
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

    private async setArticleSeen(): Promise<void> {
        if (this.state.article?.isUnread()) {
            await TicketService.getInstance().setArticleSeenFlag(
                this.state.article.TicketID, this.state.article.ArticleID
            );
            const numberOfUnseenArticles = this.context.unregisterUnseenArticle(this.state.article.ArticleID);
            if (numberOfUnseenArticles === 0) {
                await TicketService.getInstance().markTicketAsSeen(this.state.article.TicketID);
            }
            this.context.reloadObjectList(KIXObjectType.ARTICLE, true);
        }
    }

    private resizeHandling(): void {
        if (this.elementInterval) {
            clearInterval(this.elementInterval);
        }
        this.elementInterval = setInterval(() => {
            const element = (this as any).getEl('message-body');
            if (element) {
                const mainelement = element.parentElement.parentElement;
                if (mainelement) {
                    const mainWidth = mainelement.clientWidth;
                    const leftWidth = mainelement?.firstElementChild?.clientWidth || 0;
                    const rightWidth = mainelement?.lastElementChild?.clientWidth || 0;
                    const parentStyle = getComputedStyle(mainelement?.firstElementChild?.nextElementSibling);
                    const padding = (
                        Number(parentStyle.getPropertyValue('padding').replace('px', ''))
                        || 0
                    ) * 2;

                    const width = `${mainWidth - leftWidth - rightWidth - padding}px`;
                    element.style.width = width;

                    const dfElement = (this as any).getEl('article-df-container');
                    if (dfElement) {
                        dfElement.style.width = width;
                    }

                    clearInterval(this.elementInterval);
                }
            }
        }, 100);
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
