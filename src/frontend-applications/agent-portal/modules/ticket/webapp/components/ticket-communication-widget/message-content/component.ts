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
import { Attachment } from '../../../../../../model/kix/Attachment';
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
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../base-components/webapp/core/LabelService';
import { SysConfigOption } from '../../../../../sysconfig/model/SysConfigOption';
import { Article } from '../../../../model/Article';
import { ArticleColorsConfiguration } from '../../../../model/ArticleColorsConfiguration';
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

    private scrollAgainWhenLoaded: boolean;

    private observer: IntersectionObserver;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.article = input.article;

        // on update, some article was already loaded
        if (this.state.article && this.state.article.ArticleID !== this.article.ArticleID) {
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

        const newestArticleId = this.context.getAdditionalInformation('NEWEST_ARTICLE_ID');
        if (newestArticleId && Number(this.article?.ArticleID) === Number(newestArticleId)) {
            // reset value
            this.context.setAdditionalInformation('NEWEST_ARTICLE_ID', null);
            this.state.expanded = true;
            this.setArticleSeen();
            this.scrollToArticle();
            this.scrollAgainWhenLoaded = true;
        }
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe('TOGGLE_ARTICLE', this.eventSubscriber);
        EventService.getInstance().unsubscribe('READ_ALL_ARTICLES', this.eventSubscriber);

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

    private async loadArticle(silent: boolean = false, force?: boolean): Promise<void> {
        this.state.loading = !silent;

        if (!this.state.article || force) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null, [ArticleProperty.FLAGS, ArticleProperty.ATTACHMENTS, 'ObjectActions']
            );
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [this.article.ArticleID], loadingOptions,
                new ArticleLoadingOptions(this.article.TicketID)
            );

            if (articles?.length) {
                this.state.article = articles[0];
            }
        }

        await this.prepareData();
        this.state.loading = false;
        this.state.show = true;

        if (this.scrollAgainWhenLoaded) {
            this.scrollAgainWhenLoaded = false;
            setTimeout(() => {
                this.scrollToArticle();
            }, 150);
        }
    }

    private intersectionCallback(entries, observer): void {
        entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0) {
                this.loadArticle();
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

    private async prepareData(): Promise<void> {
        this.prepareAttachments();

        this.state.actions = await this.context.getAdditionalActions(this.state.article) || [];
        this.state.actions.push(
            ...await ActionFactory.getInstance().generateActions(['article-get-plain-action'], this.state.article)
        );

        this.state.isExternal = this.state.article?.SenderType === 'external';

        const contact = await TicketService.getContactForArticle(this.state.article);
        if (contact) {
            this.state.contactIcon = LabelService.getInstance().getObjectIcon(contact);
        } else {
            this.state.contactIcon = LabelService.getInstance().getObjectIconForType(KIXObjectType.CONTACT);
        }

        this.state.shortMessage = this.state.article?.Body?.substring(0, 255);
        if (this.state.article?.Body?.length > 255) {
            this.state.shortMessage += '...';
        }

        if (this.state.article) {
            this.state.articleTo = await LabelService.getInstance().getDisplayText(
                this.state.article, ArticleProperty.TO, undefined, undefined, false
            );
            this.state.articleCc = await LabelService.getInstance().getDisplayText(
                this.state.article, ArticleProperty.CC, undefined, undefined, false
            );

            const options = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [ArticleColorsConfiguration.CONFIGURATION_ID]
            ).catch((): SysConfigOption[] => []);

            if (Array.isArray(options) && options.length) {
                try {
                    const colorConfig = JSON.parse(options[0].Value);
                    this.state.backgroundColor = colorConfig && colorConfig[this.state.article.Channel] ?
                        colorConfig[this.state.article.Channel] : this.getFallbackColor();
                } catch (error) {
                    console.error(error);
                    this.state.backgroundColor = this.getFallbackColor();
                }
            } else {
                // no option means no specific color
                this.state.backgroundColor = '#fff';
            }
        }

        this.eventSubscriber = {
            eventSubscriberId: 'message-content-' + this.state.article?.ArticleID,
            eventPublished: (data: any, eventId: string): void => {
                if (eventId === 'TOGGLE_ARTICLE') {
                    this.state.expanded = data;
                    if (this.state.expanded) {
                        this.setArticleSeen();
                    }
                } else if (eventId === 'READ_ALL_ARTICLES') {
                    this.setArticleSeen();
                }
            }
        };
        EventService.getInstance().subscribe('TOGGLE_ARTICLE', this.eventSubscriber);
        EventService.getInstance().subscribe('READ_ALL_ARTICLES', this.eventSubscriber);
    }

    private getFallbackColor(): string {
        return this.state.article.Channel === 'note' ? '#fbf7e2'
            : this.state.article.Channel === 'email' ? '#e1eaeb' : '#fff';
    }

    private prepareAttachments(): void {
        const attachments = (this.state.article?.Attachments || []).filter(
            (a) => !a.Filename.match(/^file-(1|2)$/)
        );
        attachments.sort((a, b) => {
            let result = -1;
            if (a.Disposition === b.Disposition) {
                result = SortUtil.compareString(a.Filename, b.Filename);
            } else if (a.Disposition === 'inline') {
                result = 1;
            }
            return result;
        });
        this.prepareImages(attachments);
        this.state.articleAttachments = attachments;
    }

    private async prepareImages(attachments: Attachment[]): Promise<void> {
        const attachmentPromises: Array<Promise<DisplayImageDescription>> = [];
        const imageAttachments = attachments.filter((a) => a.ContentType.match(/^image\//));
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

    public toggleArticle(): void {
        this.state.expanded = !this.state.expanded;
        if (this.state.expanded) {
            this.setArticleSeen(undefined, true);
        }
    }

    private async setArticleSeen(
        article: Article = this.state.article || this.article, silent?: boolean
    ): Promise<void> {
        if (article?.isUnread()) {
            await TicketService.getInstance().setArticleSeenFlag(
                article.TicketID, article.ArticleID
            );
            await this.loadArticle(silent, true);
        }
    }
}

module.exports = Component;