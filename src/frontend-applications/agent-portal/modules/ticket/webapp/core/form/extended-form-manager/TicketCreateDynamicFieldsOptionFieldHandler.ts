/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../../model/configuration/FormFieldOption';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { JobTypes } from '../../../../../job/model/JobTypes';
import { MacroAction } from '../../../../../macro/model/MacroAction';
import { MacroActionTypeOption } from '../../../../../macro/model/MacroActionTypeOption';
import { OptionFieldHandler } from '../../../../../macro/model/OptionFieldHandler';

export class TicketCreateDynamicFieldsOptionFieldHandler extends OptionFieldHandler {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        const isDynamicFieldOption = option.Name === 'DynamicFieldList' || option.Name === 'ArticleDynamicFieldList';
        const isCreateAction = actionType === 'TicketCreate' || actionType === 'ArticleCreate';

        if (jobType === JobTypes.TICKET && isCreateAction && isDynamicFieldOption) {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }

            const objectType = option.Name === 'DynamicFieldList' ? KIXObjectType.TICKET : KIXObjectType.ARTICLE;
            return this.getOptionField(
                option, actionType, actionFieldInstanceId, 'job-input-ticketCreateDynamicField',
                defaultValue, 1, 99, 1, [new FormFieldOption('ObjectType', objectType)]
            );
        }
        return;
    }

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: any): any {
        const isDynamicFieldOption = optionName === 'DynamicFieldList' || optionName === 'ArticleDynamicFieldList';
        const isCreateAction = actionType === 'TicketCreate' || actionType === 'ArticleCreate';

        if (isDynamicFieldOption && isCreateAction) {
            if (Array.isArray(value) && value[0] && value[1] !== '') {
                return this.valueAsArray(parameter, optionName, value);
            } else {
                return parameter[optionName];
            }
        }
        return;
    }
}
