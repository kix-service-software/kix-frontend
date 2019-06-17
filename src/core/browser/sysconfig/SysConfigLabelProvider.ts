import {
    ObjectIcon, KIXObjectType, User, DateTimeUtil, SysConfigProperty, KIXObjectProperty
} from '../../model';
import { ILabelProvider } from '..';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';
import { KIXObjectService } from "../kix";
import { SysConfigOption } from '../../model/kix/sysconfig/SysConfigOption';

export class SysConfigLabelProvider implements ILabelProvider<SysConfigOption> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION;

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        if (objectData) {
            switch (property) {
                case KIXObjectProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
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
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: SysConfigOption): boolean {
        return object instanceof SysConfigOption;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SysConfigProperty.NAME:
                displayValue = 'Translatable#Key';
                break;
            case SysConfigProperty.VALUE:
                displayValue = 'Translatable#Value';
                break;
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

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        sysConfig: SysConfigOption, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = sysConfig[property];

        switch (property) {
            case SysConfigProperty.NAME:
                displayValue = sysConfig.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: SysConfigOption, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: SysConfigOption): string[] {
        return [];
    }

    public async getObjectText(
        sysConfig: SysConfigOption, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${sysConfig.Name} (${sysConfig.ObjectId})`;
    }

    public getObjectAdditionalText(object: SysConfigOption, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: SysConfigOption): string | ObjectIcon {
        return new ObjectIcon('SysConfig', object.Name);
    }

    public getObjectTooltip(object: SysConfigOption): string {
        return '';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#System Addresses' : 'Translatable#System Address'
            );
        }
        return plural ? 'SystemAddresses' : 'SystemAddress';
    }


    public async getIcons(object: SysConfigOption, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}

