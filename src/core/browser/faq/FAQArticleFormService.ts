/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from "../kix/KIXObjectFormService";
import { KIXObjectType, CRUD } from "../../model";
import { FAQArticleProperty, FAQArticle } from "../../model/kix/faq";
import { FAQService } from "./FAQService";
import { FormFieldConfiguration } from "../../model/components/form/configuration";

export class FAQArticleFormService extends KIXObjectFormService<FAQArticle> {

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

    public isServiceFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.FAQ_ARTICLE;
    }

    protected async getValue(property: string, value: any, faqArticle: FAQArticle): Promise<any> {
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
                    const inlineContent = await FAQService.getInstance().getFAQArticleInlineContent(faqArticle);
                    value = this.replaceInlineContent(faqArticle[property], inlineContent);
                    break;
                case FAQArticleProperty.ATTACHMENTS:
                    value = faqArticle.Attachments.filter((a) => a.Disposition !== 'inline');
                    break;
                default:
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
            case FAQArticleProperty.ATTACHMENTS:
                hasPermissions = await this.checkPermissions('faq/articles/*/attachments', [CRUD.CREATE]);
                break;
            case FAQArticleProperty.LINK:
                hasPermissions = await this.checkPermissions('links', [CRUD.CREATE]);
                break;
            default:
        }
        return hasPermissions;
    }

}
