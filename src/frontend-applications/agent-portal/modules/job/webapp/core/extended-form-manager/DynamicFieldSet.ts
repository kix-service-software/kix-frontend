/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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

export class DynamicFieldSet extends ExtendedJobFormManager {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        let field;
        if (jobType === JobTypes.TICKET && actionType === 'DynamicFieldSet') {
            if (option.Name === 'DynamicFieldAppend') {
                field = this.prepareAppendParameter(action, option, actionType, actionFieldInstanceId);
            } else if (option.Name === 'ObjectID') {
                field = this.prepareObjectIDParameter(action, option, actionType, actionFieldInstanceId);
            }
        }
        return field;
    }

    private prepareAppendParameter(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string
    ): FormFieldConfiguration {
        let defaultValue;
        if (action && action.Parameters) {
            defaultValue = Boolean(action.Parameters[option.Name]);
        }

        return this.getOptionField(option, actionType, actionFieldInstanceId, 'checkbox-input', defaultValue);
    }

    private prepareObjectIDParameter(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string
    ): FormFieldConfiguration {
        let defaultValue = '${ObjectID}';
        if (action && action.Parameters) {
            defaultValue = action.Parameters[option.Name];
        }
        return this.getOptionField(option, actionType, actionFieldInstanceId, null, defaultValue);
    }

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: any): any {
        if (actionType === 'DynamicFieldSet' && optionName === 'DynamicFieldAppend') {
            return Number(value);
        }
        return;
    }
}
