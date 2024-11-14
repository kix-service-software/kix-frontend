/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../model/configuration/FormFieldValue';
import { FormInstance } from '../../base-components/webapp/core/FormInstance';
import { MacroAction } from './MacroAction';
import { MacroActionTypeOption } from './MacroActionTypeOption';

export abstract class OptionFieldHandler {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        return null;
    }

    public async postPrepareOptionValue(
        actionType: string, optionName: string, value: any, parameter: any,
        field: FormFieldConfiguration, formInstance: FormInstance
    ): Promise<any> {
        return;
    }

    protected getOptionField(
        option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string, fieldType?: string,
        defaultValue?, countDefault?: number, countMax?: number, countMin?: number, options: FormFieldOption[] = []
    ): FormFieldConfiguration {
        return new FormFieldConfiguration(
            `job-action-${actionType}-${option.Name}`, option.Label,
            `${actionFieldInstanceId}###${option.Name}`,
            fieldType, Boolean(option.Required), option.Description, options,
            typeof defaultValue !== 'undefined' ? new FormFieldValue(defaultValue) : undefined,
            null, null, null, countDefault, countMax, countMin,
        );
    }

    protected valueAsArray(parameter: any, optionName: string, value: any): any {
        if (!parameter[optionName]) {
            return [value];
        } else if (Array.isArray(parameter[optionName])) {
            parameter[optionName].push(value);
            return parameter[optionName];
        }
    }

}