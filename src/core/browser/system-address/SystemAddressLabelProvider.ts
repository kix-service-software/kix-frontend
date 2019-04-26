import { ObjectIcon, KIXObjectType, SystemAddress, SystemAddressProperty } from '../../model';
import { ILabelProvider } from '..';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';

export class SystemAddressLabelProvider implements ILabelProvider<SystemAddress> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

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
                case SystemAddressProperty.VALID_ID:
                    const valid = objectData.validObjects.find((v) => v.ID === value);
                    displayValue = valid ? valid.Name : value;
                    break;
                default:
            }
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public isLabelProviderFor(object: SystemAddress): boolean {
        return object instanceof SystemAddress;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SystemAddressProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case SystemAddressProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case SystemAddressProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case SystemAddressProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case SystemAddressProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case SystemAddressProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case SystemAddressProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case SystemAddressProperty.ID:
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
        systemAddress: SystemAddress, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = systemAddress[property];

        switch (property) {
            case SystemAddressProperty.ID:
                displayValue = systemAddress.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public getDisplayTextClasses(object: SystemAddress, property: string): string[] {
        return [];
    }

    public getObjectClasses(object: SystemAddress): string[] {
        return [];
    }

    public async getObjectText(
        systemAddress: SystemAddress, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return systemAddress.Name;
    }

    public getObjectAdditionalText(object: SystemAddress, translatable: boolean = true): string {
        return '';
    }

    public getObjectIcon(object: SystemAddress): string | ObjectIcon {
        return 'kix-icon-man-bubble';
    }

    public getObjectTooltip(object: SystemAddress): string {
        return '';
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#SystemAddresses' : 'Translatable#SystemAddress'
            );
        }
        return plural ? 'SystemAddresses' : 'SystemAddress';
    }


    public async getIcons(object: SystemAddress, property: string): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        return icons;
    }

}

