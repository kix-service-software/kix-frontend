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
import { WidgetService } from '../../../../../../modules/base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../../model/configuration/WidgetType';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
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
import { Context } from '../../../../../../model/Context';
import { DisplayImageDescription } from '../../../../../base-components/webapp/core/DisplayImageDescription';
import { FAQArticleHandler } from '../../../core/FAQArticleHandler';
import { EventService } from '../../../../../base-components/webapp/core/EventService';
import { ImageViewerEvent } from '../../../../../agent-portal/model/ImageViewerEvent';
import { ImageViewerEventData } from '../../../../../agent-portal/model/ImageViewerEventData';
import { ApplicationEvent } from '../../../../../base-components/webapp/core/ApplicationEvent';

class Component {

    public eventSubscriberId: string = 'FAQContentComponent';

    private state: ComponentState;
    private contextListenerId: string = null;

    public stars: Array<string | ObjectIcon> = [];
    public rating: number;
    private images: DisplayImageDescription[];

    public onCreate(): void {
        this.state = new ComponentState();
        this.contextListenerId = IdService.generateDateBasedId('faq-content-widget');
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#Symptom', 'Translatable#Cause', 'Translatable#Solution', 'Translatable#Comment',
            'Translatable#Number of ratings'
        ]);

        WidgetService.getInstance().setWidgetType('faq-article-group', WidgetType.GROUP);

        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener(this.contextListenerId, {
            objectChanged: (id: string | number, faqArticle: FAQArticle, type: KIXObjectType | string) => {
                if (type === KIXObjectType.FAQ_ARTICLE) {
                    this.initWidget(context, faqArticle);
                }
            },
            sidebarRightToggled: (): void => { return; },
            sidebarLeftToggled: (): void => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: (): void => { return; },
            scrollInformationChanged: () => { return; },
            additionalInformationChanged: (): void => { return; }
        });

        await this.initWidget(context, await context.getObject<FAQArticle>());
        this.state.loading = false;
    }

    private async initWidget(context: Context, faqArticle?: FAQArticle): Promise<void> {
        this.state.faqArticle = faqArticle;

        if (faqArticle?.Attachments) {
            this.state.attachments = faqArticle.Attachments.filter((a) => a.Disposition !== 'inline');
            this.state.inlineContent = await FAQArticleHandler.getFAQArticleInlineContent(faqArticle);
            this.prepareImages();

            this.stars = await LabelService.getInstance().getIcons(faqArticle, FAQArticleProperty.RATING);
            this.rating = BrowserUtil.round(faqArticle.Rating);
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
            const downloadableAttachment = await this.loadAttachment(attachment, undefined, true);
            if (downloadableAttachment) {
                BrowserUtil.startFileDownload(downloadableAttachment);
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
}

module.exports = Component;
