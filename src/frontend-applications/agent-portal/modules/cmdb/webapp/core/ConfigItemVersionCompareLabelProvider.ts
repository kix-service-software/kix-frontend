/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Version } from '../../model/Version';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ConfigItemVersionCompareLabelProvider extends LabelProvider<Version> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION_COMPARE;

    public isLabelProviderFor(object: Version | KIXObject): boolean {
        return object instanceof Version || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value ? value.toString() : '';
        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }
        return displayValue;
    }

    public async getPropertyText(property: string, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case 'CONFIG_ITEM_ATTRIBUTE':
                displayValue = 'Translatable#Attributes';
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

    public async getDisplayText(
        version: Version, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = property.toString();

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = 'Translatable#Config Item Version Compare';
        if (translatable) {
            displayValue = await TranslationService.translate(displayValue, []);
        }
        return displayValue;
    }
}
