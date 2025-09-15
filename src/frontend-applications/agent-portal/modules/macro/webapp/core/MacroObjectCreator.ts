/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { IdService } from '../../../../model/IdService';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { Macro } from '../../model/Macro';
import { MacroAction } from '../../model/MacroAction';
import { MacroProperty } from '../../model/MacroProperty';
import { MacroService } from './MacroService';

export class MacroObjectCreator {

    public static async createMacro(
        macroField: FormFieldConfiguration, formInstance: FormInstance, macroComment?: string
    ): Promise<Macro> {
        const macro = new Macro();

        const macroIdOption = macroField.options.find((o) => o.option === 'MacroId');
        macro.ID = macroIdOption ? macroIdOption.value : null;

        const macroNameValue = await formInstance.getFormFieldValueByProperty(MacroProperty.NAME);
        macro.Name = macroNameValue?.value ? macroNameValue.value.toString() : IdService.generateDateBasedId('Macro-');

        const typeValue = formInstance.getFormFieldValue<string>(macroField?.instanceId);
        macro.Type = Array.isArray(typeValue?.value) ? typeValue.value[0] : typeValue.value;

        const scopeField = formInstance.getFormFieldByProperty(MacroProperty.SCOPE);
        const scopeValue = formInstance.getFormFieldValue<string>(scopeField?.instanceId);
        if (scopeValue) {
            macro.Scope = Array.isArray(scopeValue?.value) ? scopeValue.value[0] : scopeValue.value;
        }

        if (!macroComment && macro.Scope !== 'Ruleset') {
            macroComment = `Macro for "${macroNameValue.value}"`;
        }
        macro.Comment = macroComment || '';

        const validValue = await formInstance.getFormFieldValueByProperty(KIXObjectProperty.VALID_ID);
        macro.ValidID = validValue?.value ? validValue.value as number : macro.ValidID;

        macro.Actions = await this.createActions(
            macro.ID, macroField.children, formInstance, macroComment
        );

        return macro.Actions.length ? macro : null;
    }

    public static async createActions(
        macroId: number, actionFields: FormFieldConfiguration[], formInstance: FormInstance,
        macroComment?: string
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
                        action, actionField.children, formInstance, macroComment
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
        action: MacroAction, parameterFields: FormFieldConfiguration[], formInstance: FormInstance,
        macroComment?: string
    ): Promise<any> {
        const parameter = {};

        for (const parameterField of parameterFields) {
            const value = formInstance.getFormFieldValue(parameterField.instanceId);
            const optionNameValue = parameterField.options.find((o) => o.option === 'OptionName');
            if (
                optionNameValue?.value === 'MacroID'
                || optionNameValue?.value === 'ElseMacroID'
            ) {
                const macro = await this.createMacro(parameterField, formInstance, macroComment);
                macro.Name += '-' + IdService.generateDateBasedId();
                macro.Comment += ` - Referenced by Action: ${action.Type}`;
                parameter[optionNameValue.value] = macro;
            } else if (optionNameValue?.value !== 'Skip') {
                if (value && value.value !== null && typeof value.value !== 'undefined') {
                    const optionFieldHandler = MacroService.getInstance().getOptionFieldHandler() || [];
                    let prepared = false;
                    for (const handler of optionFieldHandler) {
                        const preparedValue = await handler.postPrepareOptionValue(
                            action.Type, optionNameValue.value, value.value, parameter,
                            parameterField, formInstance
                        );

                        if (preparedValue) {
                            parameter[optionNameValue.value] = typeof preparedValue !== 'undefined'
                                ? preparedValue : value.value;
                            prepared = true;
                            break;
                        }
                    }

                    if (!prepared) {
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
