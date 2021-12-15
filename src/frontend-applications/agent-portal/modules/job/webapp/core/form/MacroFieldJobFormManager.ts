/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { MacroAction } from '../../../../job/model/MacroAction';
import { MacroActionTypeOption } from '../../../../job/model/MacroActionTypeOption';
import { ExtendedJobFormManager } from '../../../../job/webapp/core/ExtendedJobFormManager';
import { JobProperty } from '../../../model/JobProperty';
import { JobTypes } from '../../../model/JobTypes';
import { JobFormService } from '../JobFormService';
import { MacroFieldCreator } from '../MacroFieldCreator';

export class MacroFieldJobFormManager extends ExtendedJobFormManager {


    private static INSTANCE: MacroFieldJobFormManager;

    public static getInstance(): MacroFieldJobFormManager {
        if (!MacroFieldJobFormManager.INSTANCE) {
            MacroFieldJobFormManager.INSTANCE = new MacroFieldJobFormManager();
        }
        return MacroFieldJobFormManager.INSTANCE;
    }

    private subscriber: IEventSubscriber;

    private constructor() {
        super();

        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId('MacroFieldJobFormManager'),
            eventPublished: (data: FormValuesChangedEventData, eventId: string): void => {
                const macroValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === JobProperty.MACROS
                );
                if (macroValue && macroValue[1]) {
                    const macroType = macroValue[1]?.value;
                    this.handleMacro(data.formInstance, macroType, macroValue[0]);
                }

                const actionValue = data.changedValues.find(
                    (cv) => cv[0] && cv[0].property === JobProperty.MACRO_ACTIONS
                );
                if (actionValue && actionValue[1]) {
                    const actionType = Array.isArray(actionValue[1].value)
                        ? actionValue[1]?.value[0]
                        : actionValue[1]?.value;
                    this.handleMacroAction(data.formInstance, actionType, actionValue[0]);
                }
            }
        };

        EventService.getInstance().subscribe(FormEvent.VALUES_CHANGED, this.subscriber);
    }

    private async handleMacro(
        formInstance: FormInstance, type: JobTypes, macroField: FormFieldConfiguration
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
            const manager = JobFormService.getInstance().getJobFormManager(type);
            fields = await MacroFieldCreator.createActionOptionFields(
                actionType, actionField.instanceId, type, formInstance, manager, null, actionField
            );
        } else {
            actionField.hint = 'Translatable#Helptext_Admin_JobCreateEdit_Actions';
        }

        formInstance.addFieldChildren(actionField, fields, true);
    }

    public async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        jobType: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        if (option.Name === 'MacroID') {
            const manager = JobFormService.getInstance().getJobFormManager(jobType);
            const field = MacroFieldCreator.createMacroField(null, formInstance, manager, actionFieldInstanceId);
            return field;
        }
        return;
    }

}