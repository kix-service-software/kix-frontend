/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { FormInstance } from '../../base-components/webapp/core/FormInstance';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { JobProperty } from '../model/JobProperty';
import { Macro } from '../model/Macro';
import { MacroAction } from '../model/MacroAction';
import { MacroActionType } from '../model/MacroActionType';
import { MacroActionTypeOption } from '../model/MacroActionTypeOption';
import { MacroFieldCreator } from '../webapp/core/MacroFieldCreator';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('MacroFieldCreator', () => {

    describe('Create initial empty macro field', () => {
        it('Should create a empty macro field with an empty action field as child', async () => {
            const macroField = await MacroFieldCreator.createMacroField(null, null, null);
            checkMacroField(macroField, null, 0);
        });
    });

    describe('Create macro field based on macro with 1 action', () => {
        let macro: Macro;
        let ownerSetAction: MacroAction;
        let originalLoadObjects;
        let ownerSetParameterOption: MacroActionTypeOption;

        let macroField: FormFieldConfiguration;

        before(async () => {
            macro = new Macro();
            macro.ID = 1;
            macro.Name = 'TestMacro';
            macro.Type = KIXObjectType.TICKET;

            ownerSetAction = new MacroAction();
            ownerSetAction.ID = 2;
            ownerSetAction.MacroID = macro.ID;
            ownerSetAction.Type = 'OwnerSet';
            ownerSetAction.Parameters = {
                OwnerLoginOrID: 2
            };
            ownerSetAction.ResultVariables = null;
            ownerSetAction.ValidID = 1;

            macro.ExecOrder = [ownerSetAction.ID];
            macro.Actions = [ownerSetAction];

            const formInstance = new FormInstance(null);
            const form = new FormConfiguration('', '', [], KIXObjectType.JOB, true, FormContext.EDIT);
            (formInstance as any).form = form;

            const ownerSetParameter = new MacroActionType();
            ownerSetParameter.Description = 'Sets the owner of a ticket.';
            ownerSetParameter.DisplayName = 'Set Owner';
            ownerSetParameter.MacroType = 'Ticket';
            ownerSetParameter.Name = 'OwnerSet';

            ownerSetParameterOption = new MacroActionTypeOption();
            ownerSetParameterOption.Description = 'The ID or login of the agent to be set.';
            ownerSetParameterOption.Label = 'Owner';
            ownerSetParameterOption.Name = 'OwnerLoginOrID';
            ownerSetParameterOption.Order = 1;
            ownerSetParameterOption.Required = 1;
            ownerSetParameter.Options = { OwnerLoginOrID: ownerSetParameterOption };

            // Mock the loadObjects functions to simulate loading of macro action types (required for action parameter)
            originalLoadObjects = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async <T extends KIXObject>(objectType: KIXObjectType | string, objectIds?: Array<number | string>): Promise<T[]> => {
                if (objectType === KIXObjectType.MACRO_ACTION_TYPE && Array.isArray(objectIds) && objectIds.length && objectIds[0] === 'OwnerSet') {
                    return [ownerSetParameter] as any[];
                }
                return [];
            }

            macroField = await MacroFieldCreator.createMacroField(macro, formInstance, null);
        });

        after(() => {
            // reset the mock
            KIXObjectService.loadObjects = originalLoadObjects;
        });

        it('Should create a correct macro input field', async () => {
            checkMacroField(macroField, macro, 1);
        });

        it('Should create a correct action input field', async () => {
            checkActionField(macroField.children[0], macroField, ownerSetAction);
        });

        it('Should create a correct skip input field', async () => {
            const actionField = macroField.children[0];

            // check the action parameters
            expect(actionField.children).an('array');
            expect(actionField.children.length).equals(2);

            const skipField = actionField.children[0];

            checkSkipField(skipField, ownerSetAction);
        });

        it('Should create a correct option input field', async () => {
            const actionField = macroField.children[0];

            // check the action parameters
            expect(actionField.children).an('array');
            expect(actionField.children.length).equals(2);

            const optionField = actionField.children[1];

            checkOptionField(optionField, actionField, ownerSetAction, ownerSetParameterOption);
        });

    });

    describe('Create macro field with a Loop action that referes an sub macro', () => {
        let formInstance: FormInstance;
        let originalLoadObjects;

        let macroField: FormFieldConfiguration;

        /**
         * Macro
         *  -> LoopAction
         *     -> LoopMacro
         *        -> OwnerSet Action
         */
        let macro: Macro;
        let loopAction: MacroAction;

        let loopMacro: Macro;
        let loopMacroIDParamterOption: MacroActionTypeOption;
        let loopValuesParamterOption: MacroActionTypeOption;

        let ownerSetAction: MacroAction;
        let ownerSetParameterOption: MacroActionTypeOption;

        before(async () => {
            macro = new Macro();
            macro.ID = 1;
            macro.Name = 'TestMacro';
            macro.Type = KIXObjectType.TICKET;

            // Submacro for Loop action
            loopMacro = new Macro();
            loopMacro.ID = 2;
            loopMacro.Name = 'Loop Macro';
            macro.Type = KIXObjectType.TICKET;

            // Loop action
            loopAction = new MacroAction();
            loopAction.ID = 1;
            loopAction.MacroID = macro.ID;
            loopAction.Type = 'Loop';
            loopAction.Parameters = {
                Values: '<KIX_TICKET_DynamicField_ChildTickets_Key>',
                MacroID: loopMacro.ID
            };
            loopAction.ResultVariables = null;
            loopAction.ValidID = 1;

            macro.ExecOrder = [loopAction.ID];
            macro.Actions = [loopAction];

            ownerSetAction = new MacroAction();
            ownerSetAction.ID = 2;
            ownerSetAction.MacroID = loopMacro.ID;
            ownerSetAction.Type = 'OwnerSet';
            ownerSetAction.Parameters = {
                OwnerLoginOrID: 2
            };
            ownerSetAction.ResultVariables = null;
            ownerSetAction.ValidID = 1;

            loopMacro.ExecOrder = [ownerSetAction.ID];
            loopMacro.Actions = [ownerSetAction];

            // Loop parameter
            loopMacroIDParamterOption = new MacroActionTypeOption();
            loopMacroIDParamterOption.Description = 'The ID of the macro to execute for each value.';
            loopMacroIDParamterOption.Label = 'MacroID';
            loopMacroIDParamterOption.Name = 'MacroID';
            loopMacroIDParamterOption.Order = 2;
            loopMacroIDParamterOption.Required = 1;

            loopValuesParamterOption = new MacroActionTypeOption();
            loopValuesParamterOption.Description = 'A list of values to go through. Either a comma separated list or an array generated by a placeholder.';
            loopValuesParamterOption.Label = 'Values';
            loopValuesParamterOption.Name = 'Values';
            loopValuesParamterOption.Order = 1;
            loopValuesParamterOption.Required = 1;

            const loopParameter = new MacroActionType();
            loopParameter.Description = 'Execute a loop over each of the given values. Each value will be the new ObjectID for the depending macro.';
            loopParameter.DisplayName = 'Loop';
            loopParameter.MacroType = 'Ticket';
            loopParameter.Name = 'Loop';
            loopParameter.Options = {
                Values: loopValuesParamterOption,
                MacroID: loopMacroIDParamterOption
            };

            // OwnerSet Parameter
            ownerSetParameterOption = new MacroActionTypeOption();
            ownerSetParameterOption.Description = 'The ID or login of the agent to be set.';
            ownerSetParameterOption.Label = 'Owner';
            ownerSetParameterOption.Name = 'OwnerLoginOrID';
            ownerSetParameterOption.Order = 1;
            ownerSetParameterOption.Required = 1;

            const ownerSetParameter = new MacroActionType();
            ownerSetParameter.Description = 'Sets the owner of a ticket.';
            ownerSetParameter.DisplayName = 'Set Owner';
            ownerSetParameter.MacroType = 'Ticket';
            ownerSetParameter.Name = 'OwnerSet';
            ownerSetParameter.Options = { OwnerLoginOrID: ownerSetParameterOption };

            formInstance = new FormInstance(null);
            const form = new FormConfiguration('', '', [], KIXObjectType.JOB, true, FormContext.EDIT);
            (formInstance as any).form = form;

            // Mock the loadObjects functions to simulate loading of macro action types (required for action parameter)
            originalLoadObjects = KIXObjectService.loadObjects;
            KIXObjectService.loadObjects = async <T extends KIXObject>(objectType: KIXObjectType | string, objectIds?: Array<number | string>): Promise<T[]> => {
                if (objectType === KIXObjectType.MACRO_ACTION_TYPE) {
                    if (Array.isArray(objectIds) && objectIds.length) {
                        if (objectIds[0] === 'OwnerSet') {
                            return [ownerSetParameter] as any[];
                        } else if (objectIds[0] === 'Loop') {
                            return [loopParameter] as any[];
                        }
                    }
                } else if (objectType === KIXObjectType.MACRO) {
                    if (Array.isArray(objectIds) && objectIds.length) {
                        if (objectIds[0] === 2) {
                            return [loopMacro] as any[];
                        }
                    }
                }
                return [];
            }

            macroField = await MacroFieldCreator.createMacroField(macro, formInstance, null);
        });

        after(() => {
            // reset the mock
            KIXObjectService.loadObjects = originalLoadObjects;
        });

        it('Should create a Macro field', async () => {
            checkMacroField(macroField, macro, 1);
        });

        it('Should create a "Loop Action" field', async () => {
            // check the action
            const actionField = macroField.children[0];
            checkActionField(actionField, macroField, loopAction);
        });

        it('Should create a correct skip input field for the loop', async () => {
            const actionField = macroField.children[0];
            expect(actionField).exist;

            expect(actionField.children).an('array');
            expect(actionField.children.length).equals(3);

            const skipField = actionField.children[0];

            checkSkipField(skipField, loopAction);
        });

        it('Should create a correct option input field for loop values', async () => {
            const actionField = macroField.children[0];

            expect(actionField.children).an('array');
            expect(actionField.children.length).equals(3);

            const optionField = actionField.children[1];
            checkOptionField(optionField, actionField, loopAction, loopValuesParamterOption)
        });

        it('Should create a correct option input field for loop MacroID', async () => {
            const actionField = macroField.children[0];

            expect(actionField.children).an('array');
            expect(actionField.children.length).equals(3);

            const optionField = actionField.children[2];
            checkOptionField(optionField, actionField, loopAction, loopMacroIDParamterOption)
        });

        it('Should create a macro input field for loop action paramter MacroID', () => {
            const actionField = macroField.children[0];

            expect(actionField.children).an('array');
            expect(actionField.children.length).equals(3);

            const loopMacroField = actionField.children[2];
            checkMacroField(loopMacroField, loopMacro, 1);
        });

        it('Should create a action input field for the OwnerSetAction', () => {
            const loopActionField = macroField.children[0];

            expect(loopActionField.children).an('array');
            expect(loopActionField.children.length).equals(3);

            const loopMacroField = loopActionField.children[2];
            expect(loopMacroField).exist;

            const actionField = loopMacroField.children[0];
            checkActionField(actionField, loopMacroField, ownerSetAction);
        });

        it('Should create a skip input field for the OwnerSet Action', () => {
            const loopActionField = macroField.children[0];

            expect(loopActionField.children).an('array');
            expect(loopActionField.children.length).equals(3);

            const loopMacroField = loopActionField.children[2];
            expect(loopMacroField).exist;

            const actionField = loopMacroField.children[0];
            expect(actionField).exist;

            const skipField = actionField.children[0];
            checkSkipField(skipField, ownerSetAction);
        });

        it('Should create a owner input field for the OwnerSet Action', () => {
            const loopActionField = macroField.children[0];

            expect(loopActionField.children).an('array');
            expect(loopActionField.children.length).equals(3);

            const loopMacroField = loopActionField.children[2];
            expect(loopMacroField).exist;

            const actionField = loopMacroField.children[0];
            expect(actionField).exist;

            const ownerField = actionField.children[1];
            checkOptionField(ownerField, actionField, ownerSetAction, ownerSetParameterOption);
        });

    });

});

function checkMacroField(macroField: FormFieldConfiguration, macro: Macro, childrenCount: number): void {
    expect(macroField).exist;

    if (macro && macro.ID) {
        const macroIdOption = macroField.options.find((o) => o.option === 'MacroId');
        expect(macroIdOption).exist;
        expect(macroIdOption.value).equals(macro.ID);
    }

    expect(macroField.required, 'Macro Field should be required.').true;
    expect(macroField.empty, 'Macro Field should not be empty.').false;
    expect(macroField.label, 'Macro Field should have label "Translatable#Macro".').equals('Translatable#Macro');
    expect(macroField.asStructure).false;
    expect(macroField.showLabel).true;
    expect(macroField.instanceId).exist;
    expect(macroField.draggableFields).true;

    expect(macroField.children).an('array');
    expect(macroField.children.length).equals(childrenCount);
}

function checkActionField(actionField: FormFieldConfiguration, macroField: FormFieldConfiguration, action: MacroAction): void {
    expect(actionField).exist;

    if (action && action.ID) {
        const actionIdOption = actionField.options.find((o) => o.option === 'ActionId');
        expect(actionIdOption).exist;
        expect(actionIdOption.value).equals(action.ID);

        expect(actionField.defaultValue).exist;
        expect(actionField.defaultValue.value).equals(action.Type);
    }

    expect(actionField.required).true;
    expect(actionField.countDefault).equals(1);
    expect(actionField.countMax).equals(200);
    expect(actionField.countMin).equals(1);
    expect(actionField.instanceId).exist;
    expect(actionField.property).equals(JobProperty.MACRO_ACTIONS);
    expect(actionField.parentInstanceId).equals(macroField.instanceId);
    expect(actionField.parent.instanceId).equals(macroField.instanceId);
}

function checkSkipField(skipField: FormFieldConfiguration, action: MacroAction): void {
    expect(skipField).exist;
    expect(skipField.required).false;
    expect(skipField.defaultValue).exist;
    expect(skipField.defaultValue.value).exist;
    expect(skipField.defaultValue.value).equals(action.ValidID === 1 ? false : true);

    const optionNameOption = skipField.options.find((o) => o.option === 'OptionName');
    expect(optionNameOption).exist;
    expect(optionNameOption.value).equals('Skip');
}

function checkOptionField(optionField: FormFieldConfiguration, actionField: FormFieldConfiguration, action: MacroAction, option: MacroActionTypeOption): void {
    expect(optionField).exist;

    const optionNameOption = optionField.options.find((o) => o.option === 'OptionName');
    expect(optionNameOption).exist;
    expect(optionNameOption.value).equals(option.Name);

    expect(optionField.defaultValue).exist;
    expect(optionField.parentInstanceId).equals(actionField.instanceId);

    if (option.Name === 'MacroID') {
        expect(optionField.required).true;
    } else {
        expect(optionField.defaultValue.value).exist;
        expect(optionField.defaultValue.value).equals(action.Parameters[option.Name]);
        expect(optionField.required).equals(Boolean(option.Required));
    }
}