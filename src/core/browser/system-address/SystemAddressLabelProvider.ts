import { ObjectIcon, KIXObjectType, SystemAddress, SystemAddressProperty, User, DateTimeUtil } from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { ObjectDataService } from '../ObjectDataService';
import { KIXObjectService } from "../kix";
import { LabelProvider } from '../LabelProvider';

export class SystemAddressLabelProvider extends LabelProvider<SystemAddress> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

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
                case SystemAddressProperty.CREATE_BY:
                case SystemAddressProperty.CHANGE_BY:
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [value], null, null, true
                    ).catch((error) => [] as User[]);
                    displayValue = users && !!users.length ? users[0].UserFullname : value;
                    break;
                case SystemAddressProperty.CREATE_TIME:
                case SystemAddressProperty.CHANGE_TIME:
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

    public isLabelProviderFor(object: SystemAddress): boolean {
        return object instanceof SystemAddress;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case SystemAddressProperty.NAME:
                displayValue = 'Translatable#Email Address';
                break;
            case SystemAddressProperty.REALNAME:
                displayValue = 'Translatable#Display Name';
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

    public async getObjectText(
        systemAddress: SystemAddress, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return `${systemAddress.Name} (${systemAddress.Realname})`;
    }

    public getObjectIcon(object: SystemAddress): string | ObjectIcon {
        return new ObjectIcon('SystemAddress', object.ID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#System Addresses' : 'Translatable#System Address'
            );
        }
        return plural ? 'SystemAddresses' : 'SystemAddress';
    }

}

