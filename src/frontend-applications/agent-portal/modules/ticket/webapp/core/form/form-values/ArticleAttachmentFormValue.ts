/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

        // FIXME: currently to not use object value (because of missing content) - done in initFormValue
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

        const context = ContextService.getInstance().getActiveContext();
        const updateArticleId = context?.getAdditionalInformation('ARTICLE_UPDATE_ID');
        if (updateArticleId) {
            const refTicketId = context?.getObjectId();
            const updateArticle = await this.getUpdateArticle();
            const updateInlineAttachments = updateArticle.getInlineAttachments();
            const attachments = await this.getRefAttachments(
                updateInlineAttachments, updateArticleId, Number(refTicketId)
            );

            newValue.push(...attachments);
        }

        const useRefArticleAttachments = context?.getAdditionalInformation('USE_REFERENCED_ATTACHMENTS');
        if (useRefArticleAttachments) {
            // FIXME: referenced article is also relevante article in ArticleEdit (better use ARTICLE_UPDATE_ID)
            // or use object value (see constructor)
            const article = await this.getReferencedArticle();
            if (article) {
                const attachments = await this.getRefAttachments(
                    article.getAttachments(), article.ArticleID, article.TicketID
                );

                newValue.push(...attachments);
                if (attachments?.length) {

                    if (Array.isArray(this.value) && this.value.length) {
                        newValue.push(...this.value);
                    }
                }
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
}