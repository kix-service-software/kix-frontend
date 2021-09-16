/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { LogFile } from '../../model/LogFile';
import { LogFileProperty } from '../../model/LogFileProperty';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class LogFileLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType | string = KIXObjectType.LOG_FILE;

    public isLabelProviderFor(object: KIXObject): boolean {
        return object instanceof LogFile || object.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case LogFileProperty.DISPLAY_NAME:
                displayValue = 'Translatable#Name';
                break;
            case LogFileProperty.FILE_SIZE:
                displayValue = 'Translatable#Size';
                break;
            case LogFileProperty.MODIFIY_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            default:
                displayValue = await super.getPropertyText(property, false, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case LogFileProperty.MODIFIY_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
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

}
