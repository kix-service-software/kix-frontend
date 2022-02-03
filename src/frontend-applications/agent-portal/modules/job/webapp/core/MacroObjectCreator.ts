/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { IdService } from '../../../../model/IdService';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { JobProperty } from '../../model/JobProperty';
import { Macro } from '../../model/Macro';
import { MacroAction } from '../../model/MacroAction';
import { JobFormService } from './JobFormService';

export class MacroObjectCreator {

    public static async createMacro(
        macroField: FormFieldConfiguration, formInstance: FormInstance
    ): Promise<Macro> {
        const macro = new Macro();

        const macroIdOption = macroField.options.find((o) => o.option === 'MacroId');
        macro.ID = macroIdOption ? macroIdOption.value : null;

        const jobNameValue = await formInstance.getFormFieldValueByProperty(JobProperty.NAME);
        macro.Name = IdService.generateDateBasedId('Macro-');
        macro.Comment = jobNameValue ? `Macro for Job "${jobNameValue.value}"` : macroField.instanceId;

        const typeValue = formInstance.getFormFieldValue<string>(macroField?.instanceId);
        macro.Type = Array.isArray(typeValue?.value) ? typeValue.value[0] : typeValue.value;

        macro.Actions = await this.createActions(macro.ID, macroField.children, formInstance, macro.Type);

        return macro.Actions.length ? macro : null;
    }

    public static async createActions(
        macroId: number, actionFields: FormFieldConfiguration[], formInstance: FormInstance, macroType: string
    ): Promise<MacroAction[]> {
        const macroActions = [];

        for (const actionField of actionFields) {
            if (!actionField.empty) {
                const action = new MacroAction();

                const actionIdValue = actionField.options.find((o) => o.option === 'ActionId');
                action.ID = actionIdValue ? actionIdValue.value : null;

                action.MacroID = macroId;

                const actionValue = formInstance.getFormFieldValue<string>(actionField.instanceId);
                if (actionValue.value) {
                    action.Type = Array.isArray(actionValue?.value)
                        ? actionValue.value[0]
                        : actionValue.value;

                    action.ResultVariables = this.createActionResultVariables(
                        action, actionField.children, formInstance
                    );

                    action.Parameters = await this.createActionParameter(
                        action, actionField.children, formInstance, macroType
                    );

                    this.setActionValid(action, actionField.children, formInstance);

                    macroActions.push(action);
                }
            }
        }

        return macroActions;
    }

    public static createActionResultVariables(
        action: MacroAction, parameterFields: FormFieldConfiguration[], formInstance: FormInstance
    ): any {
        const result = {};

        const resultParentField = parameterFields.find((p) => p.options.some((o) => o.option === 'ResultVariables'));
        if (resultParentField && Array.isArray(resultParentField.children)) {
            for (const resultField of resultParentField.children) {
                const resultNameOption = resultField.options.find((o) => o.option === 'ResultName');
                if (resultNameOption) {
                    const value = formInstance.getFormFieldValue(resultField.instanceId);
                    if (value && value.value) {
                        result[resultNameOption.value] = value.value;
                    }
                }
            }
        }

        return result;
    }

    public static async createActionParameter(
        action: MacroAction, parameterFields: FormFieldConfiguration[], formInstance: FormInstance, macroType: string
    ): Promise<any> {
        const parameter = {};

        for (const parameterField of parameterFields) {
            const value = formInstance.getFormFieldValue(parameterField.instanceId);
            const optionNameValue = parameterField.options.find((o) => o.option === 'OptionName');
            if (optionNameValue?.value === 'MacroID') {
                const macro = await this.createMacro(parameterField, formInstance);
                macro.Comment += ` - Referenced by Action: ${action.Type}`;
                parameter[optionNameValue.value] = macro;
            } else if (optionNameValue?.value !== 'Skip') {
                if (value && value.value !== null && typeof value.value !== 'undefined') {
                    const manager = JobFormService.getInstance().getJobFormManager(macroType || 'Ticket');
                    if (manager) {
                        const preparedValue = await manager.postPrepareOptionValue(
                            action.Type, optionNameValue.value, value.value, parameter,
                            parameterField, formInstance
                        );
                        parameter[optionNameValue.value] = typeof preparedValue !== 'undefined'
                            ? preparedValue : value.value;
                    } else {
                        parameter[optionNameValue.value] = value.value;
                    }
                }
            }
        }

        return parameter;
    }

    private static setActionValid(
        action: MacroAction, parameterFields: FormFieldConfiguration[], formInstance: FormInstance
    ): void {
        const skipField = parameterFields.find(
            (pf) => pf.options.some((o) => o.option === 'OptionName' && o.value === 'Skip')
        );

        if (skipField) {
            const skipValue = formInstance.getFormFieldValue(skipField.instanceId);
            action.ValidID = skipValue.value ? 2 : 1;
        }
    }

}
