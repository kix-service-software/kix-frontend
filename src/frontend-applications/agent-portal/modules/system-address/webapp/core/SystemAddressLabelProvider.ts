/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { SystemAddress } from '../../model/SystemAddress';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { SystemAddressProperty } from '../../model/SystemAddressProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class SystemAddressLabelProvider extends LabelProvider<SystemAddress> {

    public kixObjectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof SystemAddress || object.KIXObjectType === this.kixObjectType;
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
        return new ObjectIcon(null, 'SystemAddress', object.ID, null, null, 'far fa-at');
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

