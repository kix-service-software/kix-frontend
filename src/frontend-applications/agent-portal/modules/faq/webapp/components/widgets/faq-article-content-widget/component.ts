/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IdService } from '../../../../../../model/IdService';
import { WidgetType } from '../../../../../../model/configuration/WidgetType';
import { FAQArticle } from '../../../../model/FAQArticle';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { LabelService } from '../../../../../../modules/base-components/webapp/core/LabelService';
import { FAQArticleProperty } from '../../../../model/FAQArticleProperty';
import { BrowserUtil } from '../../../../../../modules/base-components/webapp/core/BrowserUtil';
import { ActionFactory } from '../../../../../../modules/base-components/webapp/core/ActionFactory';
import { Attachment } from '../../../../../../model/kix/Attachment';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { FAQArticleAttachmentLoadingOptions } from '../../../../model/FAQArticleAttachmentLoadingOptions';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../../../modules/base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { DisplayImageDescription } from '../../../../../base-components/webapp/core/DisplayImageDescription';
import { FAQArticleHandler } from '../../../core/FAQArticleHandler';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { ImageViewerEvent } from '../../../../../agent-portal/model/ImageViewerEvent';
import { ImageViewerEventData } from '../../../../../agent-portal/model/ImageViewerEventData';
import { ApplicationEvent } from '../../../../../base-components/webapp/core/ApplicationEvent';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextListenerId: string = null;

    public stars: Array<string | ObjectIcon> = [];
    public rating: number;
    private images: DisplayImageDescription[];

    public onCreate(input: any): void {
        super.onCreate(input, 'faq-article-content-widget');
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-content-widget');
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Symptom', 'Translatable#Cause', 'Translatable#Solution', 'Translatable#Comment',
            'Translatable#Number of ratings'
        ]);

        this.context.widgetService.setWidgetType('faq-article-group', WidgetType.GROUP);

        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        this.context?.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType | string) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.state.faqArticle = faqArticle;
                    this.initWidget();
                }
            },
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: (): void => { return; }
        });

        this.state.faqArticle = await this.context.getObject<FAQArticle>();
        setTimeout(() => this.initWidget(), 200);
    }

    private async initWidget(): Promise<void> {
        if (this.state.faqArticle?.Attachments) {
            this.state.attachments = this.state.faqArticle?.Attachments.filter((a) => a.Disposition !== 'inline');
            const inlineContent = await FAQArticleHandler.getFAQArticleInlineContent(this.state.faqArticle);

            const field1Value = BrowserUtil.replaceInlineContent(this.state.faqArticle?.Field1, inlineContent);
            this.state.html['field1'] = field1Value;

            const field2Value = BrowserUtil.replaceInlineContent(this.state.faqArticle?.Field2, inlineContent);
            this.state.html['field2'] = field2Value;

            const field3Value = BrowserUtil.replaceInlineContent(this.state.faqArticle?.Field3, inlineContent);
            this.state.html['field3'] = field3Value;

            const field6Value = BrowserUtil.replaceInlineContent(this.state.faqArticle?.Field6, inlineContent);
            this.state.html['field6'] = field6Value;

            this.prepareImages();

            this.stars = await LabelService.getInstance().getIcons(this.state.faqArticle, FAQArticleProperty.RATING);
            this.rating = BrowserUtil.round(this.state.faqArticle?.Rating);
            this.prepareActions();
        }
    }

    private async prepareImages(): Promise<void> {
        const attachmentPromises: Array<Promise<DisplayImageDescription>> = [];
        const imageAttachments = this.state.attachments.filter((a) => a.ContentType.match(/^image\//));
        if (imageAttachments?.length) {
            for (const imageAttachment of imageAttachments) {
                attachmentPromises.push(
                    new Promise<DisplayImageDescription>(async (resolve, reject) => {
                        const attachment = await this.loadAttachment(imageAttachment, true).catch(() => null);
                        if (attachment) {
                            const content = `data:${attachment.ContentType};base64,${attachment.Content}`;
                            resolve(new DisplayImageDescription(
                                attachment.ID, content, attachment.Comment ? attachment.Comment : attachment.Filename
                            ));
                        }
                        resolve(attachment);
                    })
                );
            }
        }
        this.images = (await Promise.all(attachmentPromises)).filter((i) => i);
    }

    private async prepareActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.faqArticle) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.faqArticle]
            );
        }
    }

    public getRatingTooltip(): string {
        const count = this.state.faqArticle.VoteCount ? this.state.faqArticle.VoteCount : 0;
        return `${this.state.translations['Translatable#Number of ratings']}: ${count}`;
    }

    public getIcon(attachment: Attachment): ObjectIcon {
        const fileName = attachment.Filename;
        const idx = fileName.lastIndexOf('.');
        if (idx >= 0) {
            const extension = fileName.substring(idx + 1, fileName.length);
            return new ObjectIcon(null, 'Filetype', extension);
        }
        return null;
    }

    public async download(attachment: Attachment, force: boolean): Promise<void> {
        if (!force && this.images && this.images.some((i) => i.imageId === attachment.ID)) {
            EventService.getInstance().publish(
                ImageViewerEvent.OPEN_VIEWER,
                new ImageViewerEventData(this.images, attachment.ID)
            );
        } else {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Prepare File Download'
            });
            const isPDF = attachment.ContentType === 'application/pdf';
            const asDownload = (isPDF && force || !isPDF);

            const downloadableAttachment = await this.loadAttachment(attachment, undefined, asDownload);
            if (downloadableAttachment) {
                if (!asDownload) {
                    BrowserUtil.openPDF(downloadableAttachment.Content, downloadableAttachment.Filename);
                } else {
                    BrowserUtil.startFileDownload(downloadableAttachment);
                }
            }
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
        }
    }

    private async loadAttachment(
        attachment: Attachment, silent?: boolean, asDownload?: boolean
    ): Promise<Attachment> {
        const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['Content']);
        const faqArticleAttachmentOptions = new FAQArticleAttachmentLoadingOptions(
            this.state.faqArticle.ID, attachment.ID, asDownload
        );
        const attachments = await KIXObjectService.loadObjects<Attachment>(
            KIXObjectType.FAQ_ARTICLE_ATTACHMENT, [attachment.ID], loadingOptions, faqArticleAttachmentOptions, silent
        ).catch(() => [] as Attachment[]);
        return attachments && attachments.length ? attachments[0] : null;
    }

    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
