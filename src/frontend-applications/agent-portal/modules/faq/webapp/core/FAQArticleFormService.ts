/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';
import { FAQArticle } from '../../model/FAQArticle';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FAQArticleProperty } from '../../model/FAQArticleProperty';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { CRUD } from '../../../../../../server/model/rest/CRUD';
import { Attachment } from '../../../../model/kix/Attachment';
import { BrowserUtil } from '../../../../modules/base-components/webapp/core/BrowserUtil';
import { FAQArticleHandler } from './FAQArticleHandler';
import { FormContext } from '../../../../model/configuration/FormContext';

export class FAQArticleFormService extends KIXObjectFormService {

    private static INSTANCE: FAQArticleFormService;

    public static getInstance(): FAQArticleFormService {
        if (!FAQArticleFormService.INSTANCE) {
            FAQArticleFormService.INSTANCE = new FAQArticleFormService();
        }
        return FAQArticleFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(objectType: KIXObjectType | string): boolean {
        return objectType === KIXObjectType.FAQ_ARTICLE;
    }

    protected async getValue(
        property: string, value: any, faqArticle: FAQArticle,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        if (value) {
            switch (property) {
                case FAQArticleProperty.KEYWORDS:
                    if (faqArticle) {
                        value = (value as string[]).join(' ');
                    }
                    break;
                case FAQArticleProperty.FIELD_1:
                case FAQArticleProperty.FIELD_2:
                case FAQArticleProperty.FIELD_3:
                case FAQArticleProperty.FIELD_6:
                    const inlineContent = await FAQArticleHandler.getFAQArticleInlineContent(faqArticle);
                    value = BrowserUtil.replaceInlineContent(faqArticle[property], inlineContent);
                    break;
                case FAQArticleProperty.ATTACHMENTS:
                    value = faqArticle.Attachments.filter((a) => a.Disposition !== 'inline');
                    break;
                default:
                    value = await super.getValue(property, value, faqArticle, formField, formContext);
            }
        }
        return value;
    }

    public async hasPermissions(field: FormFieldConfiguration): Promise<boolean> {
        let hasPermissions = true;
        switch (field.property) {
            case FAQArticleProperty.CATEGORY_ID:
                hasPermissions = await this.checkPermissions('system/faq/categories');
                break;
            case FAQArticleProperty.LINK:
                hasPermissions = await this.checkPermissions('links', [CRUD.CREATE]);
                break;
            default:
        }
        return hasPermissions;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (property === FAQArticleProperty.ATTACHMENTS) {
            if (value && value.length) {
                const attachments = await this.prepareAttachments(value);
                parameter.push([FAQArticleProperty.ATTACHMENTS, attachments]);
            }
        } else if (property === FAQArticleProperty.KEYWORDS) {
            const keywords = value ? value.toString().split(' ') : [];
            parameter.push([property, keywords]);
        } else if (property === FAQArticleProperty.CUSTOMER_VISIBLE) {
            parameter.push([property, Number(value)]);
        } else {
            parameter.push([property, value]);
        }

        return parameter;
    }

    private async prepareAttachments(files: Array<File | Attachment>): Promise<Attachment[]> {
        const attachments = [];
        const newFiles = files.filter((f) => f instanceof File);
        for (const f of newFiles) {
            const file = f as File;
            const attachment = new Attachment();
            attachment.ContentType = file.type !== '' ? file.type : 'text';
            attachment.Filename = file.name;
            attachment.Content = await BrowserUtil.readFile(file);
            attachments.push(attachment);
        }
        return [...attachments, ...files.filter((f) => !(f instanceof File))];
    }

}
