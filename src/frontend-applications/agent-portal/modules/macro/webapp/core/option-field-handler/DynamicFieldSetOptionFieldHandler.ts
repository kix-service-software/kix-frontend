/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { MacroAction } from '../../../../macro/model/MacroAction';
import { MacroActionTypeOption } from '../../../../macro/model/MacroActionTypeOption';
import { OptionFieldHandler } from '../../../../macro/model/OptionFieldHandler';

export class DynamicFieldSetOptionFieldHandler extends OptionFieldHandler {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        type: string
    ): Promise<FormFieldConfiguration> {
        let field;
        if (type === KIXObjectType.TICKET && actionType === 'DynamicFieldSet') {
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