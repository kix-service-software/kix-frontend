/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormConfiguration } from '../../../model/configuration/FormConfiguration';
import { FormContext } from '../../../model/configuration/FormContext';
import { FormFieldConfiguration } from '../../../model/configuration/FormFieldConfiguration';
import { IdService } from '../../../model/IdService';
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { ClientStorageService } from '../../base-components/webapp/core/ClientStorageService';
import { EventService } from '../../base-components/webapp/core/EventService';
import { ValidationResult } from '../../base-components/webapp/core/ValidationResult';
import { DynamicFormFieldOption } from '../../dynamic-fields/webapp/core';
import { ObjectFormHandler } from '../webapp/core/ObjectFormHandler';
import { ObjectFormRegistry } from '../webapp/core/ObjectFormRegistry';
import { FormValueProperty } from './FormValueProperty';
import { DynamicFieldObjectFormValue } from './FormValues/DynamicFieldObjectFormValue';
import { ObjectFormValue } from './FormValues/ObjectFormValue';
import { SelectObjectFormValue } from './FormValues/SelectObjectFormValue';
import { InstructionProperty } from './InstructionProperty';
import { ObjectFormEvent } from './ObjectFormEvent';
import { ObjectFormValueMapperExtension } from './ObjectFormValueMapperExtension';
import { PropertyInstruction } from './PropertyInstruction';
import { RuleResult } from './RuleResult';

export abstract class ObjectFormValueMapper<T extends KIXObject = KIXObject> {

    public object: T;
    public sourceObject: T;
    protected formValues: ObjectFormValue[] = [];
    protected form: FormConfiguration;

    protected formFieldOrder: string[] = [];
    protected fieldOrder: string[] = [];

    public instanceId: string = IdService.generateDateBasedId('ObjectFormValueMapper');
    public extensions: ObjectFormValueMapperExtension[] = [];
    public initialized: boolean = false;

    public formContext: FormContext = FormContext.NEW;

    public constructor(public objectFormHandler: ObjectFormHandler) {
        const extensions = ObjectFormRegistry.getInstance().getObjectFormValueMapperExtensions();

        for (const mapperExtension of extensions) {
            this.extensions.push(new mapperExtension(this));
        }
    }

    public destroy(): void {
        for (const mapperExtension of this.extensions) {
            mapperExtension.destroy();
        }

        this.extensions = null;

        this.form = null;

        this.destroyFormValues();
        this.formValues = [];
        this.formFieldOrder = [];
        this.fieldOrder = [];
    }

    protected destroyFormValues(formValues: ObjectFormValue[] = this.formValues): void {
        for (const value of formValues) {
            if (value.formValues?.length) {
                this.destroyFormValues(value.formValues);
            }

            value.destroy();
        }
    }

    public async mapFormValues(object: T): Promise<void> {
        this.object = object;
        const startMapObjectValues = Date.now();
        await this.mapObjectValues(object);
        const endMapObjectValues = Date.now();
        console.debug(`Map Object Values: ${(endMapObjectValues - startMapObjectValues)}ms`);

        if (Array.isArray(this.form?.pages)) {
            for (const p of this.form?.pages) {
                if (Array.isArray(p.groups)) {
                    for (const g of p.groups) {
                        if (Array.isArray(g.formFields)) {
                            await this.mapFormConfigurations(object, g.formFields);
                        }
                    }
                }
            }
        }

        this.fieldOrder = [...this.formFieldOrder];

        const startInitFormValues = Date.now();
        await Promise.all(this.initFormValues());
        const endInitFormValues = Date.now();
        console.debug(`Init Form Values: ${endInitFormValues - startInitFormValues}ms`);

        for (const mapperExtension of this.extensions) {
            const startExtension = Date.now();
            await mapperExtension.postMapFormValues(object);
            const endExtension = Date.now();
            console.debug(`Post Map Extension (${mapperExtension?.constructor?.name}): ${endExtension - startExtension}ms`);
        }

        const startCounter = Date.now();
        const endCounter = Date.now();
        console.debug(`Handle Count Values: ${endCounter - startCounter}ms`);

        this.setInitialFormValueState();

        // move dynamic fields to the end
        const index = this.formValues.findIndex((fv) => fv.property === KIXObjectProperty.DYNAMIC_FIELDS);
        if (index !== -1) {
            this.formValues.push(...this.formValues.splice(index, 1));
        }

        this.initialized = true;
        EventService.getInstance().publish(ObjectFormEvent.OBJECT_FORM_VALUE_MAPPER_INITIALIZED, this.instanceId);
    }

    protected async mapObjectValues(object: T): Promise<void> {
        this.formValues.push(new DynamicFieldObjectFormValue(KIXObjectProperty.DYNAMIC_FIELDS, object, this, null));

        for (const mapperExtension of this.extensions) {
            await mapperExtension.mapObjectValues(object);
        }
    }

    protected initFormValues(formValues = this.formValues): Array<Promise<void>> {
        const promises = [];
        for (const fv of formValues) {

            promises.push(fv.initFormValue());

            if (fv.formValues?.length) {
                promises.push(...this.initFormValues(fv.formValues));
            }
        }

        return promises;
    }

    protected setInitialFormValueState(formValues: ObjectFormValue[] = this.formValues): void {
        for (const fv of formValues) {
            fv.setInitialState();

            if (fv.formValues?.length) {
                this.setInitialFormValueState(fv.formValues);
            }

        }
    }

    private async mapFormConfigurations(
        object: T, fields: FormFieldConfiguration[], parentField?: FormFieldConfiguration
    ): Promise<void> {
        for (const field of fields) {
            await this.mapFormField(field, object);

            if (!parentField) {
                let property = field.property;
                if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                    const nameOption = field.options?.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                    property = `${KIXObjectProperty.DYNAMIC_FIELDS}.${nameOption?.value}`;
                }

                this.formFieldOrder.push(property);
            }

            if (field.children?.length) {
                await this.mapFormConfigurations(object, field.children, field);
            }
        }
    }

    protected async mapFormField(field: FormFieldConfiguration, object: T): Promise<void> {
        let formValue = this.findFormValue(field.property);
        if (!formValue) {
            if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                const dfValue = this.findFormValue(KIXObjectProperty.DYNAMIC_FIELDS);
                const nameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                if (nameOption) {
                    formValue = dfValue?.findFormValue(nameOption.value);
                    if (!formValue) {
                        formValue = await (dfValue as DynamicFieldObjectFormValue)?.createFormValue(nameOption.value);
                    }
                }
            } else {
                formValue = await this.createFormValue(field.property, object);
            }
        }

        for (const mapperExtension of this.extensions) {
            if (formValue) {
                await mapperExtension.initFormValueByField(field, formValue);
            }
        }
        await formValue?.initFormValueByField(field);
    }

    protected async createFormValue(property: string, object: T): Promise<ObjectFormValue> {
        let formValue: ObjectFormValue;
        if (property.startsWith(KIXObjectType.DYNAMIC_FIELD)) {
            formValue = new DynamicFieldObjectFormValue(property, object, this, null);
        }

        for (const mapperExtension of this.extensions) {
            formValue = await mapperExtension.createFormValue(property, object);
            if (formValue) {
                break;
            }
        }

        return formValue;
    }

    public addFormValue(formValue: ObjectFormValue): void {
        this.formValues?.push(formValue);
    }

    public findFormValue(property: string): ObjectFormValue {
        let formValue: ObjectFormValue;
        if (this.formValues) {
            for (const fv of this.formValues) {
                formValue = fv.findFormValue(property);

                if (formValue) {
                    break;
                }

                if (fv.property === property) {
                    formValue = fv;
                    break;
                }
            }
        }
        return formValue;
    }

    public getFormValues(unsorted?: boolean): ObjectFormValue[] {
        if (this.fieldOrder && !unsorted) {
            const sortedFormValues = this.fieldOrder
                .map((fo) => this.findFormValue(fo))
                .filter((fv) => typeof fv !== 'undefined' && fv.isSortable);

            const notSortedFormValues = this.formValues.filter(
                (fv) => !this.fieldOrder.some((fo) => fo === fv.property)
            );

            return [...sortedFormValues, ...notSortedFormValues];
        }
        return [...this.formValues];
    }

    public isSortedFormValue(property: string): boolean {
        const isSorted = this.fieldOrder?.some((f) => f === property);
        return isSorted;
    }

    public setFormConfiguration(form: FormConfiguration): void {
        this.form = form;
    }

    public async applyPropertyInstructions(result: RuleResult): Promise<void> {
        const debugRules = Boolean(ClientStorageService.getOption('workflow-debug'));
        if (debugRules) {
            console.debug('FormValues before applyPropertyInstructions:');
            console.debug(this.formValues);
            console.debug('Evaluation Result:');
            console.debug(result);
        }

        this.setFieldOrder(result?.InputOrder);

        await this.resetFormValues(this.formValues, result.propertyInstructions);

        for (const instruction of result.propertyInstructions) {
            await this.applyPropertyInstruction(instruction);
        }

        if (debugRules) {
            console.debug('FormValues after applyPropertyInstructions:');
            console.debug(this.formValues);
        }
    }

    protected async resetFormValues(
        formValues: ObjectFormValue[] = this.formValues, instructions: PropertyInstruction[]
    ): Promise<void> {

        const ignoreFormValueReset: string[] = [];
        for (const instruction of instructions) {
            const formValue = this.findFormValue(instruction.property);
            if (formValue) {
                const ignoreFormValueProperties = this.prepareIgnoreFormValueProperties(instruction, formValue);
                ignoreFormValueReset.push(formValue.instanceId);
                await formValue.reset([], ignoreFormValueProperties);
            }
        }

        for (const value of formValues) {
            if (!ignoreFormValueReset.some((i) => i === value.instanceId)) {
                await value.reset([], [], ignoreFormValueReset);
            }
        }
    }

    protected prepareIgnoreFormValueProperties(
        instruction: PropertyInstruction, formValue: ObjectFormValue
    ): string[] {
        const ignoreFormValueProperties = [];
        const order = instruction.instructionOrder;
        if (order.some((i) => i === InstructionProperty.ENABLE) && formValue.enabled) {
            instruction.instructionOrder = order.filter((i) => i !== InstructionProperty.ENABLE);
            ignoreFormValueProperties.push(FormValueProperty.ENABLED);
        }

        if (order.some((i) => i === InstructionProperty.POSSIBLE_VALUES) && formValue.possibleValues) {
            ignoreFormValueProperties.push(FormValueProperty.POSSIBLE_VALUES);
        }

        return ignoreFormValueProperties;
    }

    public setFieldOrder(order: string[]): void {
        const newFieldOrder = [
            ...order,
            ...this.formFieldOrder.filter((f) => !order.some((o) => f === o))
        ];

        const isChanged = !this.fieldOrder.every((value, index) => value === newFieldOrder[index]);

        if (isChanged) {
            this.fieldOrder = newFieldOrder;
            EventService.getInstance().publish(ObjectFormEvent.FIELD_ORDER_CHANGED);
        }
    }

    private async applyPropertyInstruction(instruction: PropertyInstruction): Promise<void> {
        const formValue = this.findFormValue(instruction.property);
        if (formValue) {

            const instructions = instruction.instructionOrder.sort((a, b) => {
                if (a === InstructionProperty.ENABLE) {
                    return -1;
                } else if (b === InstructionProperty.ENABLE) {
                    return 1;
                }

                return 0;
            });

            for (const instructionProperty of instructions) {
                if (instructionProperty === InstructionProperty.POSSIBLE_VALUES) {
                    formValue.resetProperty(instructionProperty);
                    await formValue.setPossibleValues(instruction.PossibleValues);
                }

                if (instructionProperty === InstructionProperty.POSSIBLE_VALUES_ADD) {
                    formValue.resetProperty(instructionProperty);
                    formValue.addPossibleValues(instruction.PossibleValuesAdd);
                }

                if (instructionProperty === InstructionProperty.POSSIBLE_VALUES_REMOVE) {
                    formValue.resetProperty(instructionProperty);
                    await formValue.removePossibleValues(instruction.PossibleValuesRemove);
                }

                if (instructionProperty === InstructionProperty.CLEAR) {
                    await formValue.setFormValue(null, true);
                }

                if (instructionProperty === InstructionProperty.SET) {
                    await formValue.setFormValue(instruction.Set, true);
                }

                if (instructionProperty === InstructionProperty.READ_ONLY) {
                    if (formValue.readonly !== instruction.ReadOnly) {
                        formValue.readonly = instruction.ReadOnly;
                    }
                }

                if (instructionProperty === InstructionProperty.WRITEABLE) {
                    if (formValue.readonly === instruction.Writeable) {
                        formValue.readonly = !instruction.Writeable;
                    }
                }

                if (instructionProperty === InstructionProperty.SHOW) {
                    await formValue.show();
                }

                if (instructionProperty === InstructionProperty.HIDE) {
                    await formValue.hide();
                }

                if (instructionProperty === InstructionProperty.REQUIRED) {
                    if (formValue.required !== instruction.Required) {
                        formValue.required = instruction.Required;
                        if (formValue.formValues && formValue.formValues.length > 0) {
                            formValue.formValues.forEach((fv) => {
                                fv.required = instruction.Required;
                            });
                        }
                    }
                }

                if (instructionProperty === InstructionProperty.OPTIONAL) {
                    if (formValue.required === instruction.Optional) {
                        formValue.required = !instruction.Optional;
                        if (formValue.formValues && formValue.formValues.length > 0) {
                            formValue.formValues.forEach((fv) => {
                                fv.required = !instruction.Optional;
                            });
                        }
                    }
                }

                if (instructionProperty === InstructionProperty.ENABLE) {
                    if (formValue.enabled !== instruction.Enable) {
                        await formValue.enable();
                    }
                }

                if (instructionProperty === InstructionProperty.DISABLE) {
                    if (formValue.enabled === instruction.Disable) {
                        await formValue.disable();
                    }
                }

                if (instructionProperty === InstructionProperty.MIN_SELECTABLE) {
                    if (formValue instanceof SelectObjectFormValue) {
                        formValue.minSelectCount = instruction.MinSelectable;
                    }
                }

                if (instructionProperty === InstructionProperty.MAX_SELECTABLE) {
                    if (formValue instanceof SelectObjectFormValue) {
                        formValue.maxSelectCount = instruction.MaxSelectable;
                    }
                }

                if (instructionProperty === InstructionProperty.COUNT_MAX) {
                    if (formValue.countMax !== instruction.CountMax) {
                        formValue.countMax = Number(instruction.CountMax) > 0
                            ? Number(instruction.CountMax)
                            : 1;
                    }
                }

                if (instructionProperty === InstructionProperty.VALIDATION) {
                    formValue.regExList = [
                        {
                            errorMessage: instruction.Validation.RegExErrorMessage,
                            regEx: instruction.Validation.RegEx
                        }
                    ];
                }

            }
        }
    }

    private mapInstructionPropertiesToFormValueProperties(instructionOrder: InstructionProperty[]): string[] {
        const properties: string[] = [];
        for (const property of instructionOrder) {
            switch (property) {
                case InstructionProperty.POSSIBLE_VALUES_ADD:
                case InstructionProperty.POSSIBLE_VALUES:
                case InstructionProperty.POSSIBLE_VALUES_REMOVE:
                    properties.push(FormValueProperty.POSSIBLE_VALUES);
                    break;

                case InstructionProperty.READ_ONLY:
                case InstructionProperty.WRITEABLE:
                    properties.push(FormValueProperty.READ_ONLY);
                    break;

                case InstructionProperty.SHOW:
                case InstructionProperty.HIDE:
                    properties.push(FormValueProperty.VISIBLE);
                    break;

                case InstructionProperty.REQUIRED:
                case InstructionProperty.OPTIONAL:
                    properties.push(FormValueProperty.VISIBLE);
                    break;

                case InstructionProperty.ENABLE:
                case InstructionProperty.DISABLE:
                    properties.push(FormValueProperty.ENABLED);
                    break;

                case InstructionProperty.COUNT_MAX:
                    properties.push(FormValueProperty.COUNT_MAX);
                    break;

                default:
                    properties.push(property);
            }

            return properties;
        }
    }

    public getValidationResults(formValues: ObjectFormValue[] = this.formValues): ValidationResult[] {
        const result = [];

        for (const fv of formValues) {
            if (fv.validationResults?.length) {
                result.push(...fv.validationResults);
            }

            if (fv.formValues?.length) {
                const childResults = this.getValidationResults(fv.formValues);
                result.push(...childResults);
            }
        }

        return result;
    }

    public validateFormValue(formValue: ObjectFormValue, force?: boolean): void {
        this.objectFormHandler?.objectFormValidator?.validate(formValue, force);
    }
}