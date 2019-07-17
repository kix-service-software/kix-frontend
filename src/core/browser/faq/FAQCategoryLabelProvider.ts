import { ObjectIcon, KIXObjectType } from "../../model";
import { FAQCategory, FAQCategoryProperty } from "../../model/kix/faq";
import { KIXObjectService } from "../kix";
import { TranslationService } from "../i18n/TranslationService";
import { LabelProvider } from "../LabelProvider";

export class FAQCategoryLabelProvider extends LabelProvider<FAQCategory> {

    public kixObjectType: KIXObjectType = KIXObjectType.FAQ_CATEGORY;

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
            case FAQCategoryProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
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

    public isLabelProviderFor(faqCategory: FAQCategory): boolean {
        return faqCategory instanceof FAQCategory;
    }

    public async getObjectText(faqCategory: FAQCategory, id: boolean = true, title: boolean = true): Promise<string> {
        return faqCategory.Name;
    }

    public getObjectIcon(faqCategory: FAQCategory): string | ObjectIcon {
        return new ObjectIcon('FAQCategory', faqCategory.ID);
    }

    public getObjectTooltip(faqCategory: FAQCategory): string {
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
            return [new ObjectIcon('FAQCategory', faqCategory.ID)];
        }
        return null;
    }

}
