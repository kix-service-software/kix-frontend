/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DefaultSelectInputFormOption } from '../../../../model/configuration/DefaultSelectInputFormOption';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormFieldOption } from '../../../../model/configuration/FormFieldOption';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { IdService } from '../../../../model/IdService';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { FormFactory } from '../../../base-components/webapp/core/FormFactory';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { ObjectReferenceOptions } from '../../../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { Macro } from '../../model/Macro';
import { MacroAction } from '../../model/MacroAction';
import { MacroActionType } from '../../model/MacroActionType';
import { MacroActionTypeOption } from '../../model/MacroActionTypeOption';
import { MacroActionTypeResult } from '../../model/MacroActionTypeResult';
import { MacroProperty } from '../../model/MacroProperty';
import { MacroType } from '../../model/MacroType';
import { MacroService } from './MacroService';

export class MacroFieldCreator {

    public static readonly MACRO_PAGE_ID = 'macro-form-page-macro';

    public static async createMacroPage(formInstance: FormInstance, macro: Macro,
        property: string = MacroProperty.MACRO, type: string = macro?.Type || 'Common',
        title: string = 'Translatable#Macro'
    ): Promise<void> {
        const macroField = await MacroFieldCreator.createMacroField(macro, formInstance, '', false, type);

        macroField.property = property;

        const page = new FormPageConfiguration(
            MacroFieldCreator.MACRO_PAGE_ID, title,
            [], true, false,
            [new FormGroupConfiguration('macro-form-group-macro', title, [], null, [macroField], true)]
        );

        formInstance.addPage(page);
    }

    public static async createMacroField(
        macro: Macro, formInstance: FormInstance, parentInstanceId: string = '',
        allowEmpty: boolean = false, type?: string
    ): Promise<FormFieldConfiguration> {
        const macroField = new FormFieldConfiguration(
            'macro-form-field-macro', '', 'Macros', 'default-select-input'
        );

        const types = await KIXObjectService.loadObjects<MacroType>(KIXObjectType.MACRO_TYPE).catch(
            (): MacroType[] => []);
        const typeNodes = [];
        types.forEach((t) => {
            if (t.DisplayName) {
                typeNodes.push(new TreeNode(t.Name, t.DisplayName));
            }
        });
        macroField.options.push(new FormFieldOption(DefaultSelectInputFormOption.NODES, typeNodes));
        macroField.options.push(new FormFieldOption(ObjectReferenceOptions.MULTISELECT, false));

        type ||= macro?.Type;

        if (parentInstanceId === '') {
            macroField.readonly = true;
            if (!type) {
                const typeValue = await formInstance?.getFormFieldValueByProperty<string>(MacroProperty.TYPE);
                type = typeValue?.value;
            }
        }

        macroField.defaultValue = new FormFieldValue<string>(type);

        macroField.required = true;
        macroField.label = 'Translatable#Macro';
        macroField.hint = 'Translatable#Relevant Macro type';
        macroField.showLabel = true;
        macroField.instanceId = `${parentInstanceId}###MACRO###${IdService.generateDateBasedId()}`;
        macroField.draggableFields = true;

        if (macro) {

            const context = ContextService.getInstance().getActiveContext();
            const duplicate = context?.getAdditionalInformation(AdditionalContextInformation.DUPLICATE);
            if (duplicate) {
                macro.ID = null;
            }
            macroField.options.push(new FormFieldOption('MacroId', macro?.ID));

            if (macro.ExecOrder && macro.ExecOrder.length) {
                const actions = this.getSortedActions(macro);

                for (const action of actions) {
                    const actionField = await this.createActionField(macroField, type, action, formInstance);

                    const childFields = await this.createActionOptionFields(
                        action.Type, actionField.instanceId, macro.Type, formInstance, action
                    );
                    actionField.children = childFields;

                    formInstance.setDefaultValueAndParent(childFields, actionField);

                    macroField.children.push(actionField);

                    // Provide values for fields
                    const values: Array<[string, any]> = [
                        [actionField.instanceId, actionField.defaultValue.value]
                    ];
                    actionField.children.forEach((c) => {
                        if (c.defaultValue) {
                            values.push([c.instanceId, c.defaultValue.value]);
                        }
                    });

                    await formInstance.provideFormFieldValues(values, null, true);
                }

                for (let i = 0; i < macroField.children.length; i++) {
                    const label = await TranslationService.translate('Translatable#{0}. Action', [i + 1]);
                    macroField.children[i].label = label;
                }
            }
        } else if (macroField.defaultValue && macroField.defaultValue.value) {
            const actionField = await this.createActionField(macroField, type, null, formInstance);
            macroField.children.push(actionField);
        }

        if (allowEmpty) {
            macroField.empty = !macro;
            macroField.countMin = 0;
        }

        return macroField;
    }

    private static getSortedActions(macro: Macro): MacroAction[] {
        const actions: MacroAction[] = [];

        macro.ExecOrder.forEach((aId) => {
            const action = macro.Actions.find((a) => a.ID === aId);
            if (action) {
                actions.push(action);
            }
        });

        macro.Actions.forEach((ma) => {
            if (!actions.some((a) => a.ID === ma.ID)) {
                actions.push(ma);
            }
        });

        return actions;
    }

    public static async createActionField(
        macroField: FormFieldConfiguration, type: string, action: MacroAction, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        const actionLabel = await TranslationService.translate('Translatable#{0}. Action', [1]);
        const actionField = new FormFieldConfiguration(
            'macro-form-field-actions', actionLabel, MacroProperty.ACTIONS, 'default-select-input',
            true, 'Translatable#Helptext_Admin_CreateEdit_Actions'
        );

        const context = ContextService.getInstance().getActiveContext();
        const duplicate = context?.getAdditionalInformation(AdditionalContextInformation.DUPLICATE);
        if (duplicate && action) {
            action.ID = null;
        }
        actionField.options.push(new FormFieldOption('ActionId', action?.ID));
        actionField.options.push(new FormFieldOption(DefaultSelectInputFormOption.UNIQUE, false));

        if (!type && macroField) {
            const macroValue = formInstance.getFormFieldValue<string>(macroField.instanceId);
            type = macroValue && macroValue.value ? macroValue.value : null;
        }

        const nodes = await MacroService.getInstance().getTreeNodes(
            MacroProperty.ACTIONS, null, null, null, null, { id: type }
        ).catch(() => []);

        actionField.options.push(new FormFieldOption(DefaultSelectInputFormOption.MULTI, false));
        actionField.options.push(new FormFieldOption(DefaultSelectInputFormOption.NODES, nodes));

        actionField.countDefault = 1;
        actionField.countMax = 200;
        actionField.countMin = 1;
        actionField.defaultValue = new FormFieldValue(action?.Type);
        actionField.instanceId = `${macroField.instanceId}###${actionField.property}###${IdService.generateDateBasedId()}`;
        actionField.parentInstanceId = macroField.instanceId;
        actionField.parent = macroField;

        return actionField;
    }

    public static async createActionOptionFields(
        actionType: string, actionFieldInstanceId: string, macroType: string,
        formInstance: FormInstance, action?: MacroAction, actionField?: FormFieldConfiguration
    ): Promise<FormFieldConfiguration[]> {
        const fieldOrderMap: Map<string, number> = new Map();
        let fields: FormFieldConfiguration[] = [];
        if (!actionFieldInstanceId || !actionType) {
            console.error('Missing "actionFieldInstanceId" or actionType!');
        } else {
            const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                KIXObjectType.MACRO_ACTION_TYPE, [actionType], null, { id: macroType }, true
            ).catch((error): MacroActionType[] => []);

            if (Array.isArray(macroActionTypes) && macroActionTypes.length) {
                const options = macroActionTypes[0].Options;

                if (actionField) {
                    actionField.hint = macroActionTypes[0].Description;
                }

                for (const optionName in options) {
                    if (optionName) {
                        const option = options[optionName] as MacroActionTypeOption;
                        if (option) {
                            const optionField = await this.createOptionField(
                                action, option, actionType, actionFieldInstanceId, macroType, formInstance
                            );

                            // split values if it is an array option field
                            // FIXME: do not use default value
                            if (optionField.countMax > 1 && Array.isArray(optionField.defaultValue.value)) {
                                for (const value of optionField.defaultValue.value) {
                                    const clonedOptionField = this.cloneOptionField(
                                        optionField, value, actionFieldInstanceId, option.Name, actionType
                                    );
                                    fieldOrderMap.set(clonedOptionField.instanceId, option.Order);
                                    fields.push(clonedOptionField);
                                }
                            } else {
                                fieldOrderMap.set(optionField.instanceId, option.Order);
                                fields.push(optionField);
                            }
                        }
                    }
                }

                fields = fields.sort((a, b) => fieldOrderMap.get(a.instanceId) - fieldOrderMap.get(b.instanceId));

                const skip = await this.createSkipField(actionType, actionFieldInstanceId, action);
                fields.unshift(skip);

                const resultField = await this.createResultField(
                    action, macroActionTypes[0], actionFieldInstanceId, formInstance
                );
                if (resultField) {
                    fields.unshift(resultField);
                }
            }
        }
        return fields;
    }

    public static async createResultField(
        action: MacroAction, actionType: MacroActionType, actionFieldInstanceId: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {

        const fields: FormFieldConfiguration[] = [];
        const values = [];
        for (const resultName in actionType.Results) {
            if (resultName) {
                const result = actionType.Results[resultName] as MacroActionTypeResult;
                if (result) {

                    const resultField = new FormFieldConfiguration(
                        `macro-action-${actionType.Name}-result-${result.Name}`,
                        result.Name,
                        `${actionFieldInstanceId}-${actionType.Name}###RESULT###${result.Name}`,
                        null
                    );

                    resultField.instanceId = `${actionFieldInstanceId}-${actionType.Name}###ResultGroup###${result.Name}`;
                    resultField.required = false;
                    resultField.hint = result.Description;
                    resultField.translateLabel = false;

                    let defaultValue: string;
                    if (action && action.ResultVariables) {
                        defaultValue = action.ResultVariables[result.Name];
                        values.push([resultField.instanceId, defaultValue]);
                    }

                    resultField.defaultValue = typeof defaultValue !== 'undefined'
                        ? new FormFieldValue(defaultValue)
                        : undefined;
                    resultField.options = [
                        new FormFieldOption('ResultName', result.Name)
                    ];

                    fields.push(resultField);
                }
            }
        }

        await formInstance.provideFormFieldValues(values, null, true);

        const resultParentField = new FormFieldConfiguration(
            `macro-action-${actionType.Name}-resultGroup`, 'Translatable#Result names', `${actionFieldInstanceId}###RESULTGROUP`, null
        );

        resultParentField.instanceId = `${actionFieldInstanceId}###RESULTGROUP`;
        resultParentField.required = false;
        resultParentField.hint = 'Translatable#Helptext_Create_ResultNames';
        resultParentField.children = fields;
        resultParentField.empty = true;
        resultParentField.asStructure = true;
        resultParentField.options = [
            new FormFieldOption('ResultVariables', 'ResultVariables')
        ];

        return fields.length ? resultParentField : null;
    }

    public static async createOptionField(
        action: MacroAction, option: MacroActionTypeOption, actionType: string, actionFieldInstanceId: string,
        macroType: string, formInstance: FormInstance
    ): Promise<FormFieldConfiguration> {
        const nameOption = new FormFieldOption('OptionName', option.Name);

        if (option.Name !== 'MacroID') {
            const optionFieldHandler = MacroService.getInstance().getOptionFieldHandler();
            for (const extendedManager of optionFieldHandler) {
                const result = await extendedManager.createOptionField(
                    action, option, actionType, actionFieldInstanceId, macroType, formInstance
                );

                if (result) {
                    result.instanceId = `${actionFieldInstanceId}###${actionType}###${option.Name}`;
                    if (Array.isArray(result.options)) {
                        result.options.push(nameOption);
                    } else {
                        result.options = [nameOption];
                    }
                    return result;
                }
            }
        }

        let defaultValue;
        if (action && action.Parameters) {
            defaultValue = action.Parameters[option.Name];
        }

        let optionField = new FormFieldConfiguration(
            `macro-action-${actionType}-${option.Name}`, option.Label, `${actionFieldInstanceId}###${actionType}###${option.Name}`, null
        );

        optionField.instanceId = `${actionFieldInstanceId}###${actionType}###${option.Name}`;
        optionField.required = Boolean(option.Required);
        optionField.hint = option.Description;
        optionField.defaultValue = typeof defaultValue !== 'undefined' ? new FormFieldValue(defaultValue) : undefined;
        optionField.property = optionField.instanceId;

        if (option.Name === 'MacroID') {
            let subMacro: Macro;
            if (defaultValue) {
                let macroIds: number[] = defaultValue;
                if (!Array.isArray(defaultValue)) {
                    macroIds = [defaultValue];
                }

                const macros = await KIXObjectService.loadObjects<Macro>(
                    KIXObjectType.MACRO, macroIds,
                    new KIXObjectLoadingOptions(null, null, null, [MacroProperty.ACTIONS])
                ).catch((e): Macro[] => []);

                if (Array.isArray(macros) && macros.length) {
                    subMacro = macros[0];
                }
            }

            optionField = await this.createMacroField(subMacro, formInstance, actionFieldInstanceId);
        }

        optionField.parentInstanceId = actionFieldInstanceId;
        optionField.options.push(nameOption);

        return optionField;
    }

    private static cloneOptionField(
        optionField: FormFieldConfiguration, value: any,
        actionFieldInstanceId: string, optionName: string, actionType: string
    ): FormFieldConfiguration {
        const field = FormFactory.cloneField(optionField);
        field.instanceId = IdService.generateDateBasedId(optionField.id);
        field.defaultValue = new FormFieldValue(value);
        // special instance id to distinguish between the actions
        field.existingFieldId = IdService.generateDateBasedId(`${actionFieldInstanceId}###${actionType}###${optionName}`);
        return field;
    }

    public static async createSkipField(
        actionType: string, actionFieldInstanceId: string, action?: MacroAction
    ): Promise<FormFieldConfiguration> {
        let value: any;
        if (action) {
            value = action[KIXObjectProperty.VALID_ID] !== 1;
        }
        const skipField = new FormFieldConfiguration(
            `macro-action-${actionType}-skip`, 'Translatable#Skip', `${actionFieldInstanceId}###SKIP`, 'checkbox-input'
        );

        skipField.instanceId = IdService.generateDateBasedId(`${actionFieldInstanceId}###SKIP`);
        skipField.required = false;
        skipField.hint = 'Translatable#Helptext_Admin_CreateEdit_ActionSkip';
        skipField.defaultValue = typeof value !== 'undefined'
            ? new FormFieldValue(value)
            : new FormFieldValue(false);

        skipField.options = [
            new FormFieldOption('OptionName', 'Skip')
        ];

        return skipField;
    }
}