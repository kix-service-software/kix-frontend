import { ILabelProvider } from "./ILabelProvider";
import { KIXObjectType, ObjectIcon, KIXObjectProperty, DateTimeUtil, User, ValidObject } from "../model";
import { KIXObjectService } from "./kix";
import { TranslationService } from "./i18n/TranslationService";

export class LabelProvider<T = any> implements ILabelProvider<T> {

    public kixObjectType: KIXObjectType;

    public isLabelProviderFor(object: T): boolean {
        throw new Error("Method not implemented.");
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getObjectText(object: T, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return object.toString();
    }

    public async getObjectName(plural?: boolean, translatable?: boolean): Promise<string> {
        return '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string> {
        let displayValue = property;
        switch (property) {
            case KIXObjectProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            default:
                displayValue = property;
        }
        return displayValue;
    }

    public async getDisplayText(
        object: T, property: string, defaultValue?: string, translatable?: boolean
    ): Promise<string> {
        return await this.getPropertyValueDisplayText(property, object[property], translatable);
    }

    public getObjectAdditionalText(object: T, translatable?: boolean): string {
        return '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable?: boolean
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                const validObjects = await KIXObjectService.loadObjects<ValidObject>(KIXObjectType.VALID_OBJECT);
                const valid = validObjects.find((v) => v.ID === value);
                displayValue = valid ? valid.Name : value;
                break;
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getObjectTooltip(object: T, translatable?: boolean): string {
        return '';
    }

    public getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return null;
    }

    public getDisplayTextClasses(object: T, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: T): string[] {
        return [];
    }

    public getObjectIcon(object?: T): string | ObjectIcon {
        return null;
    }

    public async getIcons(object: T, property: string, value?: string | number): Promise<Array<(string | ObjectIcon)>> {
        return [];
    }

    public canShow(property: string, object: T): boolean {
        return true;
    }

}
