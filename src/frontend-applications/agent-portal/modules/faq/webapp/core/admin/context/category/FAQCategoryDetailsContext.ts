/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../../../model/Context";
import { LabelService } from "../../../../../../../modules/base-components/webapp/core/LabelService";
import { FAQCategory } from "../../../../../model/FAQCategory";
import { BreadcrumbInformation } from "../../../../../../../model/BreadcrumbInformation";
import { AdminContext } from "../../../../../../admin/webapp/core";
import { KIXObject } from "../../../../../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { TranslationService } from "../../../../../../../modules/translation/webapp/core/TranslationService";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";


export class FAQCategoryDetailsContext extends Context {

    public static CONTEXT_ID = 'faq-category-details';

    public getIcon(): string {
        return 'kix-icon-admin';
    }

    public async getDisplayText(short: boolean = false): Promise<string> {
        return await LabelService.getInstance().getObjectText(await this.getObject<FAQCategory>(), true, !short);
    }

    public async getBreadcrumbInformation(): Promise<BreadcrumbInformation> {
        const objectName = await TranslationService.translate('Translatable#FAQ Category');
        const category = await this.getObject<FAQCategory>();
        return new BreadcrumbInformation(this.getIcon(), [AdminContext.CONTEXT_ID], `${objectName}: ${category.Name}`);
    }

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType | string = KIXObjectType.FAQ_CATEGORY,
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
        let faqCategory: FAQCategory;
        if (this.objectId) {
            const categoryId = Number(this.objectId);

            const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
                KIXObjectType.FAQ_CATEGORY, [categoryId], null, null, cache
            ).catch((error) => {
                console.error(error);
                return null;
            });

            if (faqCategories && faqCategories.length) {
                faqCategory = faqCategories[0];
                this.objectId = faqCategory.ID;
            }
        }

        return faqCategory;
    }

}
