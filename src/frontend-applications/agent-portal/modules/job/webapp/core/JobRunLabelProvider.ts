/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { JobRun } from '../../model/JobRun';
import { JobRunProperty } from '../../model/JobRunProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class JobRunLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType = KIXObjectType.JOB_RUN;

    public isLabelProviderFor(object: JobRun | KIXObject): boolean {
        return object instanceof JobRun || object.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue;
        switch (property) {
            case JobRunProperty.END_TIME:
                displayValue = 'Translatable#End time';
                break;
            case JobRunProperty.START_TIME:
                displayValue = 'Translatable#Start time';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Start by';
                break;
            case JobRunProperty.STATE:
            case JobRunProperty.STATE_ID:
                displayValue = 'Translatable#State';
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
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case JobRunProperty.START_TIME:
            case JobRunProperty.END_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                translatable = false;
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

}
