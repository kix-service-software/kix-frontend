/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { MacroAction } from '../../model/MacroAction';
import { MacroActionTypeOption } from '../../model/MacroActionTypeOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { ExtendedJobFormManager } from './ExtendedJobFormManager';
import { JobTypes } from '../../model/JobTypes';

export class TicketJobFormManagerFetchAssetAttributes extends ExtendedJobFormManager {

    public getActionOptionField(
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

    private getOptionField(
        option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string, fieldType?: string,
        defaultValue?, countDefault?: number, countMax?: number, countMin?: number
    ): FormFieldConfiguration {
        return new FormFieldConfiguration(
            `job-action-${actionType}-${option.Name}`, option.Label,
            `ACTION###${actionFieldInstanceId}###${option.Name}`,
            fieldType, Boolean(option.Required), option.Description, undefined,
            typeof defaultValue !== 'undefined' ? new FormFieldValue(defaultValue) : undefined,
            null, null, null, countDefault, countMax, countMin,
        );
    }

    public postPrepareOptionValue(action: MacroAction, optionName: string, value: any): any {
        if (optionName === 'AttributeDFMapping') {

            // collect the values as list
            if (!action.Parameters[optionName]) {
                return [value];
            } else if (Array.isArray(action.Parameters[optionName])) {
                action.Parameters[optionName].push(value);
                return action.Parameters[optionName];
            }
        }
        return;
    }

}
