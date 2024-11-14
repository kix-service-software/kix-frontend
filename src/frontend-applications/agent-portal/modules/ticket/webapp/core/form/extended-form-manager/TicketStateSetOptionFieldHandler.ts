/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultSelectInputFormOption } from '../../../../../../model/configuration/DefaultSelectInputFormOption';
import { FormFieldConfiguration } from '../../../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../../../model/configuration/FormFieldOption';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../../../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { JobTypes } from '../../../../../job/model/JobTypes';
import { MacroAction } from '../../../../../macro/model/MacroAction';
import { MacroActionTypeOption } from '../../../../../macro/model/MacroActionTypeOption';
import { TicketState } from '../../../../model/TicketState';
import { OptionFieldHandler } from '../../../../../macro/model/OptionFieldHandler';

export class TicketStateSetOptionFieldHandler extends OptionFieldHandler {

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string
    ): Promise<FormFieldConfiguration> {
        if (jobType === JobTypes.TICKET && actionType === 'StateSet') {
            let defaultValue;
            if (action && action.Parameters) {
                defaultValue = action.Parameters[option.Name];
            }
            if (option.Name === 'TargetTime') {
                return this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'default-select-input',
                    defaultValue, undefined, undefined, undefined,
                    [
                        new FormFieldOption(DefaultSelectInputFormOption.NODES,
                            [
                                new TreeNode('NONE', '-'),
                                new TreeNode('BOB', 'Translatable#Begin of Business Day'),
                                new TreeNode('EOB', 'Translatable#End of Business Day'),
                            ]),
                        new FormFieldOption(DefaultSelectInputFormOption.MULTI, false)
                    ]
                );
            } else if (option.Name === 'State') {
                const field = this.getOptionField(
                    option, actionType, actionFieldInstanceId, 'object-reference-input',
                    defaultValue, undefined, undefined, undefined,
                    [
                        new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.TICKET_STATE),
                        new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false),
                        new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, false),
                        new FormFieldOption(ObjectReferenceOptions.FREETEXT, true)
                    ]
                );
                return field;
            }
        }
        return;
    }

    public async postPrepareOptionValue(
        actionType: string, optionName: string, value: any, parameter: any
    ): Promise<any> {
        if (actionType === 'StateSet') {
            if (optionName === 'TargetTime') {
                if (Array.isArray(value)) {
                    return value[0];
                } else {
                    return value;
                }
            } else if (optionName === 'State' && !isNaN(value)) {
                const objects = await KIXObjectService.loadObjects<TicketState>(KIXObjectType.TICKET_STATE, [value]);
                const state = Array.isArray(objects) && objects.length ? objects[0] : null;
                if (state) {
                    return state.Name;
                }
            }
        }
        return;
    }
}