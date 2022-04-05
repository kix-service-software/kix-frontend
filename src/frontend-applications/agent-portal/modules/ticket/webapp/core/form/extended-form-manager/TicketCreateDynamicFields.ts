/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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

export class TicketCreateDynamicFields extends ExtendedJobFormManager {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
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

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: any): any {
        if (actionType === 'TicketCreate' && optionName === 'DynamicFieldList') {
            if (Array.isArray(value) && value[0] && value[1] !== '') {
                return this.valueAsArray(parameter, optionName, value);
            } else {
                return parameter[optionName];
            }
        }
        return;
    }
}
