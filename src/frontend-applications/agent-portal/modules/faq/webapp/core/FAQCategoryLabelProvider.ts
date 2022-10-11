/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { FAQCategory } from '../../model/FAQCategory';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FAQCategoryProperty } from '../../model/FAQCategoryProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class FAQCategoryLabelProvider extends LabelProvider<FAQCategory> {

    public kixObjectType: KIXObjectType | string = KIXObjectType.FAQ_CATEGORY;

    public async getPropertyText(
        property: string, short: boolean = false, translatable: boolean = true
    ): Promise<string> {
        let displayValue = property;
        switch (property) {
            case FAQCategoryProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case FAQCategoryProperty.FULL_NAME:
                displayValue = 'Translatable#Fullname';
                break;
            case FAQCategoryProperty.PARENT_ID:
                displayValue = 'Translatable#Parent Category';
                break;
            case FAQCategoryProperty.SUB_CATEGORIES:
                displayValue = 'Translatable#Sub Category';
                break;
            case FAQCategoryProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        faqCategory: FAQCategory, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = faqCategory[property];

        switch (property) {
            case FAQCategoryProperty.ID:
            case 'ICON':
                displayValue = faqCategory.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case FAQCategoryProperty.PARENT_ID:
                if (value) {
                    const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(
                        KIXObjectType.FAQ_CATEGORY, [value], null, null, true
                    ).catch((error) => [] as FAQCategory[]);
                    displayValue = faqCategories && !!faqCategories.length ? faqCategories[0].Name : value;
                }
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: FAQCategory | KIXObject): boolean {
        return object instanceof FAQCategory || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(
        faqCategory: FAQCategory, id: boolean = true, title: boolean = true, translatable: boolean = true
    ): Promise<string> {
        return translatable ? await TranslationService.translate(faqCategory.Name) : faqCategory.Name;
    }

    public getObjectIcon(faqCategory: FAQCategory): string | ObjectIcon {
        return faqCategory
            ? new ObjectIcon(null, KIXObjectType.FAQ_CATEGORY, faqCategory.ID, null, null, 'kix-icon-faq')
            : 'kix-icon-faq';
    }

    public async getObjectTooltip(faqCategory: FAQCategory, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(faqCategory.Name);
        }
        return faqCategory.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#FAQ Categories' : 'Translatable#FAQ Category'
            );
        }
        return plural ? 'FAQ Categories' : 'FAQ Category';
    }

    public async getIcons(
        faqCategory: FAQCategory, property: string, value?: number | string
    ): Promise<Array<string | ObjectIcon>> {
        if (property === FAQCategoryProperty.ID || property === FAQCategoryProperty.ICON) {
            return [this.getObjectIcon(faqCategory)];
        }
        return null;
    }

}
