/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AgentPortalConfiguration } from '../../../../model/configuration/AgentPortalConfiguration';
import { Attachment } from '../../../../model/kix/Attachment';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { InlineContent } from '../../../base-components/webapp/core/InlineContent';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { CKEditorService } from '../../../ck-editor/webapp/core/CKEditorService';
import { RichTextFormValue } from '../../../object-forms/model/FormValues/RichTextFormValue';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigService } from '../../../sysconfig/webapp/core';
import { ArticleProperty } from '../../../ticket/model/ArticleProperty';
import { TiptapEditorService } from '../../../tiptap/webapp/core/TipTapEditorService';
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
                let editor;
                const editorType = await this.getEditorType();
                if (editorType === 'ckeditor5') {
                    editor = CKEditorService.getInstance().getActiveEditor();
                } else {
                    editor = TiptapEditorService.getInstance().getActiveEditor();
                }
                const bodyValue = objectFormValueMapper.findFormValue(
                    ArticleProperty.BODY) as RichTextFormValue;
                if (!editor?.getValue()) {
                    await bodyValue.setFormValueFromExtern(faqArticleHTML);
                } else {
                    const newValue = editor?.getValue() + '<br>' + faqArticleHTML;
                    await bodyValue.setFormValueFromExtern(newValue);
                }
            }

            const attachments = await this.getFAQArticleAttachments(articleId);
            if (attachments?.length) {
                const attachmentValue = objectFormValueMapper.findFormValue(ArticleProperty.ATTACHMENTS);
                if (attachmentValue) {
                    if (Array.isArray(attachmentValue.value)) {
                        const allAttachments: Attachment[] = [...attachmentValue.value, ...attachments];
                        const finalAttachments = allAttachments.filter(
                            (att, index, self) => index === self.findIndex(
                                (att2) => att.ObjectId === att2.ObjectId)
                        );
                        await attachmentValue.setFormValue([...finalAttachments]);
                    } else {
                        await attachmentValue.setFormValue([...attachments]);
                    }
                }
            }
        }
    }

    private static async getEditorType(): Promise<string> {
        const validEditors = ['tiptap', 'ckeditor5'];

        const apConfig = await SysConfigService.getInstance().getPortalConfiguration<AgentPortalConfiguration>();
        const rawType = apConfig?.editorType;
        let editorType = rawType?.toLowerCase() || 'ckeditor5';

        if (!validEditors.includes(editorType)) {
            console.warn(`[AgentPortal] Invalid editorType "${editorType}". Falling back to "ckeditor5".`);
            editorType = 'ckeditor5';
        }

        return editorType;
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
