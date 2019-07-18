/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectIcon, KIXObjectType, SystemAddress, SystemAddressProperty } from '../../model';
import { TranslationService } from '../i18n/TranslationService';
import { LabelProvider } from '../LabelProvider';

export class SystemAddressLabelProvider extends LabelProvider<SystemAddress> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    public isLabelProviderFor(object: SystemAddress): boolean {
        return object instanceof SystemAddress;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
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
            case SystemAddressProperty.ID:
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
        systemAddress: SystemAddress, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = systemAddress[property];

        switch (property) {
            case SystemAddressProperty.ID:
                displayValue = systemAddress.Name;
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

