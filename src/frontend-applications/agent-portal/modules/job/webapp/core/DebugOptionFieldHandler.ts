/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { MacroAction } from '../../../macro/model/MacroAction';
import { MacroActionTypeOption } from '../../../macro/model/MacroActionTypeOption';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { OptionFieldHandler } from '../../../macro/model/OptionFieldHandler';

export class DebugOptionFieldHandler extends OptionFieldHandler {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string
    ): Promise<FormFieldConfiguration> {
        if (option.Name === 'Debug') {
            let defaultValue: FormFieldValue;
            if (option.DefaultValue) {
                defaultValue = new FormFieldValue(option.DefaultValue);
            }
            if (action && action.Parameters) {
                defaultValue = new FormFieldValue(action.Parameters[option.Name]);
            }
            return this.getOptionField(
                option, actionType, actionFieldInstanceId, 'checkbox-input',
                typeof defaultValue !== 'undefined' ? defaultValue.value : 0
            );
        }

        return null;
    }

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: any): any {
        if (optionName === 'Debug') {
            return value ? 1 : 0;
        }
        return;
    }
}
