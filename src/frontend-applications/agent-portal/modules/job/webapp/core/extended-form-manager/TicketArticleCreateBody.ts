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

export class TicketArticleCreateBody extends ExtendedJobFormManager {

    public createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): FormFieldConfiguration {
        if (
            jobType === JobTypes.TICKET
            && (actionType === 'ArticleCreate' || actionType === 'TicketCreate')
            && option.Name === 'Body'
        ) {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }

            return new FormFieldConfiguration(
                `job-action-${actionType}-${option.Name}`, option.Label,
                `${actionFieldInstanceId}###${option.Name}`,
                'rich-text-input', Boolean(option.Required), option.Description, undefined,
                typeof defaultValue !== 'undefined' ? new FormFieldValue(defaultValue) : undefined
            );
        }
        return;
    }
}
