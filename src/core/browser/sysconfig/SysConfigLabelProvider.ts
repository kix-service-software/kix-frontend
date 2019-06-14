import {
    ObjectIcon, KIXObjectType, User, DateTimeUtil, SysConfigProperty
} from '../../model';
import { ILabelProvider } from '..';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';
import { KIXObjectService } from "../kix";
import { SysConfigItem } from '../../model/kix/sysconfig/SysConfigItem';

export class SysConfigLabelProvider implements ILabelProvider<SysConfigItem> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYS_CONFIG_ITEM;

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
                case SysConfigProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                case SysConfigProperty.CREATE_BY:
                case SysConfigProperty.CHANGE_BY:
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                    break;
                case SysConfigProperty.CREATE_TIME:
                case SysConfigProperty.CHANGE_TIME:
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

    public isLabelProviderFor(object: SysConfigItem): boolean {
        return object instanceof SysConfigItem;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SysConfigProperty.ID:
                displayValue = 'Translatable#Key';
                break;
            case SysConfigProperty.VALUE:
                displayValue = 'Translatable#Value';
                break;
            case SysConfigProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case SysConfigProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case SysConfigProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case SysConfigProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case SysConfigProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case SysConfigProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case SysConfigProperty.ID:
                displayValue = 'Translatable#Id';
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
        sysConfig: SysConfigItem, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = sysConfig[property];

        switch (property) {
            case SysConfigProperty.ID:
                displayValue = sysConfig.ID;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: SysConfigItem, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: SysConfigItem): string[] {
        return [];
    }

    public async getObjectText(
        sysConfig: SysConfigItem, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${sysConfig.ID} (${sysConfig.ObjectId})`;
    }

    public getObjectAdditionalText(object: SysConfigItem, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: SysConfigItem): string | ObjectIcon {
        return new ObjectIcon('SysConfig', object.ID);
    }

    public getObjectTooltip(object: SysConfigItem): string {
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


    public async getIcons(object: SysConfigItem, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}

