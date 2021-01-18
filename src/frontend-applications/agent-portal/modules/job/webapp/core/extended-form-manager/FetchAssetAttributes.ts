/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { MacroAction } from '../../../model/MacroAction';
import { MacroActionTypeOption } from '../../../model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../ExtendedJobFormManager';
import { JobTypes } from '../../../model/JobTypes';

export class FetchAssetAttributes extends ExtendedJobFormManager {

    public createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): FormFieldConfiguration {
        let field: FormFieldConfiguration;
        if (jobType === JobTypes.TICKET && actionType === 'FetchAssetAttributes') {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }
            if (option.Name === 'ForceSet') {
                field = this.getOptionField(option, actionType, actionFieldInstanceId, 'checkbox-input', defaultValue);
            } else if (option.Name === 'AttributeDFMapping') {
                field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'job-input-fetchAssetAttributesMapping',
                    defaultValue, 1, 99, 1
                );
            }
        }

        return field;
    }

    public postPrepareOptionValue(action: MacroAction, optionName: string, value: any): any {
        if (optionName === 'AttributeDFMapping') {
            return this.valueAsArray(action, optionName, value);
        }
        return;
    }

}
