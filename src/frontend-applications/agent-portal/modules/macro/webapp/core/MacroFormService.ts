/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../base-components/webapp/core/KIXObjectFormService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { FormContext } from '../../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormInstance } from '../../../base-components/webapp/core/FormInstance';
import { Macro } from '../../model/Macro';
import { MacroProperty } from '../../model/MacroProperty';
import { MacroObjectCreator } from './MacroObjectCreator';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { MacroFieldCreator } from './MacroFieldCreator';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';

export class MacroFormService extends KIXObjectFormService {

    private static INSTANCE: MacroFormService;

    public static getInstance(): MacroFormService {
        if (!MacroFormService.INSTANCE) {
            MacroFormService.INSTANCE = new MacroFormService();
        }
        return MacroFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType | string): boolean {
        return kixObjectType === KIXObjectType.MACRO;
    }

    public async prePrepareForm(
        form: FormConfiguration, macro: Macro, formInstance: FormInstance
    ): Promise<void> {
        if (macro && form.formContext === FormContext.EDIT) {
            await MacroFieldCreator.createMacroPage(formInstance, macro, 'Macros');
        }
    }

    protected async getValue(
        property: string, value: any, macro: Macro,
        formField: FormFieldConfiguration, formContext: FormContext
    ): Promise<any> {
        switch (property) {
            case MacroProperty.NAME:
                if (value && formContext === FormContext.NEW && macro) {
                    const name = await TranslationService.translate(
                        'Translatable#Copy of {0}', [value]
                    );
                    value = name;
                }
                break;
            default:
        }

        return value;
    }

    public async postPrepareValues(
        parameter: Array<[string, any]>, createOptions: KIXObjectSpecificCreateOptions,
        formContext: FormContext, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {
        parameter = parameter.filter((p) => !p[0].startsWith('###MACRO###'));
        parameter = parameter.filter((p) => p[0] !== 'Macros' || p[1] !== null);

        parameter = await super.postPrepareValues(parameter, createOptions, formContext, formInstance);

        return parameter;
    }

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any, formInstance: FormInstance
    ): Promise<Array<[string, any]>> {

        let result: Array<[string, any]> = [[property, value]];

        if (property === 'Macros') {
            if (!formField.parentInstanceId) {
                value = await MacroObjectCreator.createMacro(formField, formInstance);
            } else {
                value = null;
            }

            result = [[property, value]];
        }


        return result;
    }

    public async getNewFormField(
        formInstance: FormInstance, f: FormFieldConfiguration, parent?: FormFieldConfiguration
    ): Promise<FormFieldConfiguration> {
        if (f.property === MacroProperty.ACTIONS) {
            return await MacroFieldCreator.createActionField(f.parent, 'Common', null, formInstance);
        }

        return super.getNewFormField(formInstance, f, parent);
    }

    public async updateFields(fields: FormFieldConfiguration[]): Promise<void> {
        if (Array.isArray(fields) && fields.some((f) => f.property === MacroProperty.ACTIONS)) {
            for (let i = 0; i < fields.length; i++) {
                const label = await TranslationService.translate('Translatable#{0}. Action', [i + 1]);
                fields[i].label = label;
            }
        }
    }

}
