/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Version } from '../../model/Version';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { VersionProperty } from '../../model/VersionProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class ConfigItemVersionLabelProvider extends LabelProvider<Version> {

    public kixObjectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public isLabelProviderFor(object: Version | KIXObject): boolean {
        return object instanceof Version || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;

        switch (property) {
            case VersionProperty.BASED_ON_CLASS_VERSION:
                displayValue = value ? 'Translatable#(Current version)' : '';
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case VersionProperty.COUNT_NUMBER:
                displayValue = 'Translatable#Version';
                break;
            case VersionProperty.BASED_ON_CLASS_VERSION:
                displayValue = 'Translatable#Based on class definition';
                break;
            case VersionProperty.DEPL_STATE_ID:
                displayValue = 'Translatable#Deployment State';
                break;
            case VersionProperty.INCI_STATE_ID:
                displayValue = 'Translatable#Incident State';
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
        version: Version, property: string, value?: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = version[property];

        switch (property) {
            case VersionProperty.CREATE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(
                    property, displayValue ? displayValue : value, translatable
                );
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getObjectName(): Promise<string> {
        return 'Config Item Version';
    }

}
