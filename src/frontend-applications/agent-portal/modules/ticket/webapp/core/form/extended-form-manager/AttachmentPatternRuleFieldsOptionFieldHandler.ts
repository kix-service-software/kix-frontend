/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { JobTypes } from '../../../../../job/model/JobTypes';
import { MacroAction } from '../../../../../macro/model/MacroAction';
import { MacroActionTypeOption } from '../../../../../macro/model/MacroActionTypeOption';
import { OptionFieldHandler } from '../../../../../macro/model/OptionFieldHandler';

export class AttachmentPatternRuleFieldsOptionFieldHandler extends OptionFieldHandler {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        const isRuleFieldOption = option.Name === 'KeepRules' || option.Name === 'DeleteRules';
        const isRelevantMacroAction = actionType === 'ArticleAttachmentsDelete';

        if (jobType === JobTypes.TICKET && isRuleFieldOption && isRelevantMacroAction) {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }
            else if (option.DefaultValue) {
                defaultValue = option.DefaultValue;
            }

            return this.getOptionField(
                option, actionType, actionFieldInstanceId, 'job-input-attachmentPatternRule',
                defaultValue, 1, 99, option.Name === 'DeleteRules' ? 1 : 0
            );
        }
        return;
    }

    public postPrepareOptionValue(actionType: string, optionName: string, value: any, parameter: any): any {
        const isRuleFieldOption = optionName === 'KeepRules' || optionName === 'DeleteRules';
        const isRelevantMacroAction = actionType === 'ArticleAttachmentsDelete';

        if (isRuleFieldOption && isRelevantMacroAction) {
            if (Array.isArray(value) && value[0] !== '' && value[1] !== '' && value[2] !== '') {
                return this.valueAsArray(parameter, optionName, value);
            } else {
                return parameter[optionName];
            }
        }
        return;
    }
}
