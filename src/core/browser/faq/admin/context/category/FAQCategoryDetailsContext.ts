/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, BreadcrumbInformation, KIXObject, KIXObjectType
} from "../../../../../model";
import { AdminContext } from "../../../../admin";
import { EventService } from "../../../../event";
import { KIXObjectService } from "../../../../kix";
import { LabelService } from "../../../../LabelService";
import { ApplicationEvent } from "../../../../application";
import { TranslationService } from "../../../../i18n/TranslationService";
import { FAQCategory } from "../../../../../model/kix/faq";

export class FAQCategoryDetailsContext extends Context {

    public static CONTEXT_ID = 'faq-category-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getText(await this.getObject<FAQCategory>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#FAQ Category');
        const category = await this.getObject<FAQCategory>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${category.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.FAQ_CATEGORY,
        reload: boolean = false, changedProperties: string[] = []
    ): Promise<O> {
        const object = await this.loadFAQCategory(changedProperties) as any;

        if (reload) {
            this.listeners.forEach(
                (l) => l.objectChanged(Number(this.objectId), object, KIXObjectType.FAQ_CATEGORY, changedProperties)
            );
        }

        return object;
    }

    private async loadFAQCategory(changedProperties: string[] = [], cache: boolean = true): Promise<FAQCategory> {
        const categoryId = Number(this.objectId);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load FAQ Category'
            });
        }, 500);

        const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
            KIXObjectType.FAQ_CATEGORY, [categoryId], null, null, cache
        ).catch((error) => {
            console.error(error);
            return null;
        });

        window.clearTimeout(timeout);

        let faqCategory: FAQCategory;
        if (faqCategories && faqCategories.length) {
            faqCategory = faqCategories[0];
            this.objectId = faqCategory.ID;
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false, hint: '' });

        return faqCategory;
    }

}
