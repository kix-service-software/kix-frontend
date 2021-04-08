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
import { FormFieldValue } from '../../../../../model/configuration/FormFieldValue';
import { ExtendedJobFormManager } from '../ExtendedJobFormManager';
import { JobTypes } from '../../../model/JobTypes';

export class TicketArticleCreate extends ExtendedJobFormManager {

    public createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): FormFieldConfiguration {
        if (
            jobType === JobTypes.TICKET
            && (actionType === 'ArticleCreate' || actionType === 'TicketCreate')
        ) {
            if (option.Name === 'Body') {
                let defaultValue;
                if (action && action.Parameters) {
                    defaultValue = action.Parameters[option.Name];
                }
                return this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'rich-text-input',
                    defaultValue
                );
            } else if (option.Name === 'CustomerVisible') {
                let defaultValue;
                if (action && action.Parameters) {
                    defaultValue = Boolean(action.Parameters[option.Name]);
                }
                return this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'checkbox-input',
                    defaultValue
                );
            }
        }
        return;
    }

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: {}): any {
        if ((actionType === 'ArticleCreate' || actionType === 'TicketCreate') && optionName === 'CustomerVisible') {
            return Number(value);
        }
        return;
    }
}