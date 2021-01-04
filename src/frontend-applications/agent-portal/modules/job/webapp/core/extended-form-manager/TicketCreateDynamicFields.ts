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

export class TicketCreateDynamicFields extends ExtendedJobFormManager {

    public getActionOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): FormFieldConfiguration {
        if (
            jobType === JobTypes.TICKET
            && actionType === 'TicketCreate'
            && option.Name === 'DynamicFieldList'
        ) {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }

            return this.getOptionField(
                option, actionType, actionFieldInstanceId, 'job-input-ticketCreateDynamicField',
                defaultValue, 1, 99, 1
            );
        }
        return;
    }

    public postPrepareOptionValue(action: MacroAction, optionName: string, value: any): any {
        if (optionName === 'DynamicFieldList') {
            if (Array.isArray(value) && value[0] && value[1] !== '' && value[1] !== '') {
                return this.valueAsArray(action, optionName, value);
            } else {
                return action.Parameters[optionName];
            }
        }
        return;
    }
}
