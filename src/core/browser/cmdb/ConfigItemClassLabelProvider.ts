import { ILabelProvider } from '..';
import {
    ObjectIcon, KIXObjectType, ConfigItemClass, ConfigItemClassProperty, DateTimeUtil, User
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";
import { KIXObjectService } from "../kix";

export class ConfigItemClassLabelProvider implements ILabelProvider<ConfigItemClass> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public async getPropertyValueDisplayText(
        property: string, value: string | number | any = '', translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        switch (property) {
            case ConfigItemClassProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case ConfigItemClassProperty.CREATE_BY:
            case ConfigItemClassProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case ConfigItemClassProperty.CREATE_TIME:
            case ConfigItemClassProperty.CHANGE_TIME:
                displayValue = DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue.toString();
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case ConfigItemClassProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case ConfigItemClassProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case ConfigItemClassProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case ConfigItemClassProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case ConfigItemClassProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case ConfigItemClassProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case ConfigItemClassProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case ConfigItemClassProperty.ID:
                displayValue = 'Translatable#Icon';
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

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        ciClass: ConfigItemClass, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = ciClass[property];

        switch (property) {
            case ConfigItemClassProperty.ID:
            case 'ICON':
                displayValue = ciClass.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayTextClasses(ciClass: ConfigItemClass, property: string): string[] {
        return [];
    }

    public getObjectClasses(ciClass: ConfigItemClass): string[] {
        return [];
    }

    public isLabelProviderFor(ciClass: ConfigItemClass): boolean {
        return ciClass instanceof ConfigItemClass;
    }

    public async getObjectText(
        ciClass: ConfigItemClass, id: boolean = true, name: boolean = true, translatable?: boolean
    ): Promise<string> {
        return ciClass.Name;
    }

    public getObjectAdditionalText(ciClass: ConfigItemClass): string {
        return null;
    }

    public getObjectIcon(ciClass: ConfigItemClass): string | ObjectIcon {
        return 'kix-icon-ci';
    }

    public getObjectTooltip(ciClass: ConfigItemClass): string {
        return ciClass.Name;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#CI Classes' : 'Translatable#CI Class'
            );
        }
        return plural ? 'CI Classes' : 'CI Class';
    }

    public async getIcons(
        ciClass: ConfigItemClass, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        let icons = [];
        if (ciClass) {
            switch (property) {
                case ConfigItemClassProperty.ID:
                case 'ICON':
                    icons.push(new ObjectIcon(KIXObjectType.CONFIG_ITEM_CLASS, ciClass.ID));
                    break;
                default:
                    icons = [];
            }
        }
        return icons;
    }
}
