import {
    ObjectIcon, KIXObjectType, User, DateTimeUtil, KIXObjectProperty, SysConfigOptionDefinitionProperty, ValidObject
} from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { KIXObjectService } from "../kix";
import { SysConfigOptionDefinition } from '../../model/kix/sysconfig/SysConfigOptionDefinition';
import { LabelProvider } from '../LabelProvider';

export class SysConfigLabelProvider extends LabelProvider<SysConfigOptionDefinition> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                if (value) {
                    const validObjects = await KIXObjectService.loadObjects<ValidObject>(
                        KIXObjectType.VALID_OBJECT, [value], null, null, true
                    ).catch((error) => [] as ValidObject[]);
                    displayValue = validObjects && !!validObjects.length ? validObjects[0].Name : value;
                }
                break;
            case KIXObjectProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case SysConfigOptionDefinitionProperty.IS_MODIFIED:
                displayValue = value === 1 ? 'Translatable#Modified' : '';
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = JSON.stringify(value);
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

    public isLabelProviderFor(object: SysConfigOptionDefinition): boolean {
        return object instanceof SysConfigOptionDefinition;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SysConfigOptionDefinitionProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = 'Translatable#Value';
                break;
            case SysConfigOptionDefinitionProperty.IS_MODIFIED:
                displayValue = 'Translatable#Modified';
                break;
            case KIXObjectProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
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

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        sysConfig: SysConfigOptionDefinition, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = sysConfig[property];
        switch (property) {
            case SysConfigOptionDefinitionProperty.NAME:
                displayValue = sysConfig.Name;
                break;
            case SysConfigOptionDefinitionProperty.VALUE:
                displayValue = sysConfig.IsModified === 1
                    ? sysConfig.Value : sysConfig.Default;
                displayValue = sysConfig.Type === "Hash"
                    ? JSON.stringify(displayValue) : displayValue;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: SysConfigOptionDefinition, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: SysConfigOptionDefinition): string[] {
        return [];
    }

    public async getObjectText(
        sysConfig: SysConfigOptionDefinition, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${sysConfig.Name} (${sysConfig.ObjectId})`;
    }

    public getObjectAdditionalText(object: SysConfigOptionDefinition, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: SysConfigOptionDefinition): string | ObjectIcon {
        return new ObjectIcon('SysConfig', object.Name);
    }

    public getObjectTooltip(object: SysConfigOptionDefinition): string {
        return '';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#' : 'Translatable#'
            );
        }
        return plural ? '' : '';
    }


    public async getIcons(object: SysConfigOptionDefinition, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}

