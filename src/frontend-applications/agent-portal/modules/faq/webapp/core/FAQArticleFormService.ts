/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { FileService } from '../../../file/webapp/core/FileService';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';

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
            case KIXObjectProperty.LINKS:
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

        let loadingHint = await TranslationService.translate('Translatable#Prepare Attachments (0/{0})', [files.length]);
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: true, hint: loadingHint
        });

        let index = 0;

        for (const f of newFiles) {
            index++;
            let loadingHint = await TranslationService.translate(
                'Translatable#Prepare Attachments ({0}/{1})', [index, files.length]
            );
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: loadingHint
            });

            const file = f as File;
            const attachment = new Attachment();
            attachment.ContentType = file.type !== '' ? file.type : 'text';
            attachment.Filename = file.name;
            await FileService.uploadFile(file);
            attachments.push(attachment);
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
            loading: false
        });

        return [...attachments, ...files.filter((f) => !(f instanceof File))];
    }

}
