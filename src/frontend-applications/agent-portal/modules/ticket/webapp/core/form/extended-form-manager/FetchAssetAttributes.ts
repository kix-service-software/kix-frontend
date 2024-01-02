/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { JobTypes } from '../../../../../job/model/JobTypes';
import { MacroAction } from '../../../../../job/model/MacroAction';
import { MacroActionTypeOption } from '../../../../../job/model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../../../../../job/webapp/core/ExtendedJobFormManager';


export class FetchAssetAttributes extends ExtendedJobFormManager {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
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

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: any): any {
        if (actionType === 'FetchAssetAttributes' && optionName === 'AttributeDFMapping') {
            return this.valueAsArray(parameter, optionName, value);
        }
        return;
    }

}
