/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Attachment } from '../../../../model/kix/Attachment';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { InlineContent } from '../../../base-components/webapp/core/InlineContent';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { ArticleProperty } from '../../../ticket/model/ArticleProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { FAQArticle } from '../../model/FAQArticle';
import { FAQArticleAttachmentLoadingOptions } from '../../model/FAQArticleAttachmentLoadingOptions';
import { FAQArticleProperty } from '../../model/FAQArticleProperty';

export class FAQArticleHandler {

    public static async publishFAQArticleAsHTMLWithAttachments(articleId: number): Promise<void> {

        // FIXME: add on object, not on form value (if binding works again)
        const context = ContextService.getInstance().getActiveContext();
        const formhandler = await context?.getFormManager()?.getObjectFormHandler();
        const objectFormValueMapper = formhandler?.objectFormValueMapper;
        if (objectFormValueMapper) {
            const faqArticleHTML = await FAQArticleHandler.prepareFAQArticleHTML(articleId);
            if (faqArticleHTML) {
                const bodyValue = objectFormValueMapper.findFormValue(ArticleProperty.BODY);
                if (bodyValue) {
                    if (!bodyValue.value) {
                        bodyValue.value = faqArticleHTML;
                    } else {
                        bodyValue.value += faqArticleHTML;
                    }
                }
            }

            const attachments = await this.getFAQArticleAttachments(articleId);
            if (attachments?.length) {
                const attachmentValue = objectFormValueMapper.findFormValue(ArticleProperty.ATTACHMENTS);
                if (attachmentValue) {
                    if (Array.isArray(attachmentValue.value)) {
                        attachmentValue.value = [...attachmentValue.value, ...attachments];
                    } else {
                        attachmentValue.value = [...attachments];
                    }
                }
            }
        }
    }

    public static async getFAQArticleAttachments(articleId: number): Promise<Attachment[]> {
        let attachments = [];

        const faqArticles = await KIXObjectService.loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [articleId],
            new KIXObjectLoadingOptions(null, null, null, [FAQArticleProperty.ATTACHMENTS, 'Content'])
        );

        if (Array.isArray(faqArticles) && faqArticles.length) {
            const faqArticle = faqArticles[0];
            attachments = faqArticle.Attachments.filter((a) => a.Disposition !== 'inline');
        }

        return attachments;
    }

    public static async prepareFAQArticleHTML(articleId: number): Promise<string> {
        let result = '';
        const faqArticles = await KIXObjectService.loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [articleId],
            new KIXObjectLoadingOptions(null, null, null, [FAQArticleProperty.ATTACHMENTS])
        );

        if (Array.isArray(faqArticles) && faqArticles.length) {
            const faqArticle = faqArticles[0];

            result = `<h1>${faqArticle.Title}</h1>`;

            result += await this.getFieldValue(FAQArticleProperty.FIELD_1, faqArticle.Field1);
            result += await this.getFieldValue(FAQArticleProperty.FIELD_2, faqArticle.Field2);
            result += await this.getFieldValue(FAQArticleProperty.FIELD_3, faqArticle.Field3);

            const inlineContent = await this.getFAQArticleInlineContent(faqArticle);
            result = BrowserUtil.replaceInlineContent(result, inlineContent);

        }

        return result;
    }

    private static async getFieldValue(field: string, value: string): Promise<string> {
        let result = '';
        if (await this.isPublicField(field) && value) {
            const fieldLabel = await this.getFieldLabel(field);
            if (fieldLabel) {
                result += `<h2>${fieldLabel}</h2>`;
            }
            result += value;
        }
        return result;
    }

    public static async getAttachmentSummaryHTML(articleId: number): Promise<string> {
        let result = '';
        const faqArticles = await KIXObjectService.loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, [articleId],
            new KIXObjectLoadingOptions(null, null, null, [FAQArticleProperty.ATTACHMENTS])
        );

        if (Array.isArray(faqArticles) && faqArticles.length) {
            const faqArticle = faqArticles[0];

            if (Array.isArray(faqArticle.Attachments) && faqArticle.Attachments.length) {
                result = await TranslationService.translate('Translatable#Attachments', []);
                result = `<h2>${result} (${faqArticle.Attachments.length})</h2>`;

                result += '<ul>';
                faqArticle.Attachments.forEach((a) => {
                    result += `<li>${a.Filename} (${a.Filesize})</li>`;
                });
                result += '</ul>';
            }
        }

        return result;
    }

    private static async isPublicField(field: string): Promise<boolean> {
        let isPublic = false;

        const options = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [`FAQ::Item::${field}`]
        );

        if (Array.isArray(options) && options.length) {
            isPublic = options[0].Value && options[0].Value.Show;
        }

        return isPublic;
    }

    private static async getFieldLabel(field: string): Promise<string> {
        let label = '';

        const options = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [`FAQ::Item::${field}`]
        );

        if (Array.isArray(options) && options.length) {
            label = options[0].Value ? options[0].Value.Caption : '';
        }

        if (label) {
            label = await TranslationService.translate(label);
        }

        return label;
    }

    public static async getFAQArticleInlineContent(faqArticle: FAQArticle): Promise<InlineContent[]> {
        const inlineContent: InlineContent[] = [];
        if (faqArticle.Attachments) {
            const inlineAttachments = faqArticle.Attachments.filter((a) => a.Disposition === 'inline');
            for (const attachment of inlineAttachments) {
                const loadingOptions = new KIXObjectLoadingOptions(null, null, null, ['Content']);
                const faqArticleAttachmentOptions = new FAQArticleAttachmentLoadingOptions(
                    faqArticle.ID, attachment.ID
                );
                const attachments = await KIXObjectService.loadObjects<Attachment>(
                    KIXObjectType.FAQ_ARTICLE_ATTACHMENT, [attachment.ID], loadingOptions,
                    faqArticleAttachmentOptions
                );
                for (const attachmentItem of attachments) {
                    if (attachment.ID === attachmentItem.ID) {
                        attachment.Content = attachmentItem.Content;
                    }
                }
            }

            inlineAttachments.forEach(
                (a) => inlineContent.push(new InlineContent(a.ContentID, a.Content, a.ContentType))
            );
        }
        return inlineContent;
    }

}
