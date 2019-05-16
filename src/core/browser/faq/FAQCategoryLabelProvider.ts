import { DateTimeUtil, ObjectIcon, KIXObjectType, User } from "../../model";
import { FAQCategory, FAQCategoryProperty } from "../../model/kix/faq";
import { KIXObjectService } from "../kix";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";
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
            case FAQCategoryProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case FAQCategoryProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case FAQCategoryProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case FAQCategoryProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case FAQCategoryProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case FAQCategoryProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case FAQCategoryProperty.ID:
                displayValue = 'Translatable#Id';
                break;
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();

        if (objectData) {
            switch (property) {
                case FAQCategoryProperty.CHANGE_TIME:
                case FAQCategoryProperty.CREATE_TIME:
                    displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                    break;
                case FAQCategoryProperty.CREATE_BY:
                case FAQCategoryProperty.CHANGE_BY:
                    if (displayValue) {
                        const users = await KIXObjectService.loadObjects<User>(
                            KIXObjectType.USER, [displayValue], null, null, true
                        ).catch((error) => [] as User[]);
                        displayValue = users && !!users.length ? users[0].UserFullname : displayValue;
                    }
                    break;
                case FAQCategoryProperty.PARENT_ID:
                    const faqCategories = await KIXObjectService.loadObjects<FAQCategory>(KIXObjectType.FAQ_CATEGORY);
                    const category = faqCategories.find((fc) => fc.ID === value);
                    displayValue = category ? category.Name : value;
                    break;
                case FAQCategoryProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                    if (valid) {
                        displayValue = valid.Name;
                    }
                    break;
                default:
                    displayValue = value;
            }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
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
        if (property === FAQCategoryProperty.ID || property === 'ICON') {
            return [new ObjectIcon('FAQCategory', faqCategory.ID)];
        }
        return null;
    }

}
