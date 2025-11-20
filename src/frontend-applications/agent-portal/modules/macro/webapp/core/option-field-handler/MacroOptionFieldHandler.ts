/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { IdService } from '../../../../../model/IdService';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { FormEvent } from '../../../../base-components/webapp/core/FormEvent';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { FormValuesChangedEventData } from '../../../../base-components/webapp/core/FormValuesChangedEventData';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { MacroAction } from '../../../../macro/model/MacroAction';
import { MacroActionTypeOption } from '../../../../macro/model/MacroActionTypeOption';
import { MacroFieldCreator } from '../../../../macro/webapp/core/MacroFieldCreator';
import { OptionFieldHandler } from '../../../../macro/model/OptionFieldHandler';
import { MacroProperty } from '../../../model/MacroProperty';

export class MacroOptionFieldHandler extends OptionFieldHandler {

    private readonly subscriber: IEventSubscriber;

    public constructor() {
        super();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('MacroOptionFieldHandler'),
            eventPublished: function (data: FormValuesChangedEventData, eventId: string): void {
                const macroValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === 'Macros'
                );
                if (macroValue?.[1]) {
                    const macroType = macroValue[1]?.value;
                    this.handleMacro(data.formInstance, macroType, macroValue[0]);
                }

                const actionValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === MacroProperty.ACTIONS
                );
                if (actionValue?.[1]) {
                    const actionType = Array.isArray(actionValue[1].value)
                        ? actionValue[1]?.value[0]
                        : actionValue[1]?.value;
                    this.handleMacroAction(data.formInstance, actionType, actionValue[0]);
                }
            }.bind(this)
        };
        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.subscriber);
    }

    private async handleMacro(
        formInstance: FormInstance, type: string, macroField: FormFieldConfiguration
    ): Promise<void> {
        let fields = [];
        if (type) {
            const field = await MacroFieldCreator.createActionField(macroField, type, null, formInstance);
            fields = [field];
        }

        formInstance.addFieldChildren(macroField, fields, true);
    }

    private async handleMacroAction(
        formInstance: FormInstance, actionType: string, actionField: FormFieldConfiguration
    ): Promise<void> {
        const macroField = actionField.parent;
        const typeValue = formInstance.getFormFieldValue<string>(macroField?.instanceId);

        let fields = [];

        if (actionType) {
            const type = Array.isArray(typeValue?.value) ? typeValue.value[0] : typeValue?.value;
            fields = await MacroFieldCreator.createActionOptionFields(
                actionType, actionField.instanceId, type, formInstance, null, actionField
            );
        } else {
            actionField.hint = 'Translatable#Helptext_Admin_CreateEdit_Actions';
        }

        formInstance.addFieldChildren(actionField, fields, true);
    }

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        type: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        if (
            option.Name === 'MacroID'
            || option.Name === 'ElseMacroID'
        ) {
            const field = MacroFieldCreator.createMacroField(
                null, formInstance, actionFieldInstanceId, null, null,
                option.Label, option.Description, Boolean(option.Required)
            );
            return field;
        }
        return;
    }

}