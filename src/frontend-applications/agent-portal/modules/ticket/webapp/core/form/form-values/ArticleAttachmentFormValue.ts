/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { Attachment } from '../../../../../../model/kix/Attachment';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { TicketService } from '../../TicketService';
import { TicketSocketClient } from '../../TicketSocketClient';

export class ArticleAttachmentFormValue extends ObjectFormValue<Attachment[]> {

    public options: Array<[string, any]> = [];

    public constructor(
        public property: string,
        article: Article,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, article, objectValueMapper, parent);
        this.inputComponentId = 'attachment-form-input';

        // FIXME: do not use object values - done in initFormValue, to prevent duplicates
        this.value = null;
    }

    public async initFormValueByField(field: FormFieldConfiguration): Promise<void> {
        await super.initFormValueByField(field);

        const multiUpload = field?.options.find((o) => o.option === 'MULTI_FILES');
        if (multiUpload) {
            this.options.push([multiUpload.option, multiUpload.value]);
        }

        const mimeTypes = field?.options.find((o) => o.option === 'MimeTypes');
        if (mimeTypes) {
            this.options.push([mimeTypes.option, mimeTypes.value]);
        }
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();

        const newValue = [];

        // use predefined value
        if (Array.isArray(this.value) && this.value.length) {
            newValue.push(...this.value);
        }

        const context = ContextService.getInstance().getActiveContext();
        const updateArticleId = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');
        const useRefArticleAttachments = context?.getAdditionalInformation('USE_REFERENCED_ATTACHMENTS');

        // if no prefedined value is set on update or the referenced attachments should implicitly be used, add them
        if ((!newValue.length && updateArticleId) || useRefArticleAttachments) {
            const article = updateArticleId ? await this.getUpdateArticle() : await this.getReferencedArticle();
            if (article) {
                const attachments = await this.getRefAttachments(
                    article.getAttachments(), article.ArticleID, article.TicketID
                );
                newValue.push(...attachments);
            }
        }

        this.setFormValue(newValue, true);
    }

    private async getUpdateArticle(): Promise<Article> {
        const context = ContextService.getInstance().getActiveContext();
        const articleId = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');
        const refTicketId = context?.getObjectId();
        const article = await this.loadReferencedArticle(Number(refTicketId), Number(articleId));
        return article;
    }

    private async getReferencedArticle(): Promise<Article> {
        const context = ContextService.getInstance().getActiveContext();
        let article = context.getAdditionalInformation('REFERENCED_ARTICLE');

        const refArticleId = context?.getAdditionalInformation(ArticleProperty.REFERENCED_ARTICLE_ID);
        if (!article && refArticleId) {
            const refTicketId = context?.getObjectId();
            article = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
        }

        return article;
    }

    private async loadReferencedArticle(refTicketId: number, refArticleId: number): Promise<Article> {
        let article: Article;
        if (refArticleId && refTicketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [refArticleId], new KIXObjectLoadingOptions(
                    null, null, null, [ArticleProperty.ATTACHMENTS]
                ),
                new ArticleLoadingOptions(refTicketId), true
            ).catch(() => [] as Article[]);
            article = articles.find((a) => a.ArticleID === refArticleId);
        }
        return article;
    }

    private async getRefAttachments(
        articleAttachments: Attachment[], refArticleId: number, refTicketId: number
    ): Promise<Attachment[]> {
        let attachmentsWithContent: Attachment[] = [];
        if (Array.isArray(articleAttachments) && articleAttachments.length) {
            const attachmentPromises = [];
            articleAttachments.forEach((a) => {
                if (!a.Content) {
                    const attachmentPromise = TicketService.getInstance().loadArticleAttachment(
                        Number(refTicketId), refArticleId, a.ID, true
                    );
                    if (attachmentPromise) {
                        attachmentPromises.push(attachmentPromise);
                    }
                } else {
                    attachmentPromises.push(a);
                }
            });
            attachmentsWithContent = await Promise.all(attachmentPromises);
        }
        return attachmentsWithContent;
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (Array.isArray(value) && value.length === 0) {
            value = null;
        }

        await super.setFormValue(value, force);
    }

    public destroy(): void {
        super.destroy();
        if (Array.isArray(this.value) && this.value.length) {
            const downloadIds = this.value.filter((a) => a.downloadId).map((a) => a.downloadId);
            if (downloadIds.length) {
                TicketSocketClient.getInstance().removeArticleAttachmentDownloads(downloadIds);
            }
        }
    }
}