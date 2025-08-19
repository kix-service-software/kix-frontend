/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { BrowserCacheService } from '../../base-components/webapp/core/CacheService';
import { ClientStorageService } from '../../base-components/webapp/core/ClientStorageService';
import { EventService } from '../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../base-components/webapp/core/KIXObjectService';
import { ValidationResult } from '../../base-components/webapp/core/ValidationResult';
import { DynamicFormFieldOption } from '../../dynamic-fields/webapp/core';
import { FormConfigurationUtil } from '../webapp/core/FormConfigurationUtil';
import { InteractionHandler } from '../webapp/core/InteractionHandler';
import { ObjectFormHandler } from '../webapp/core/ObjectFormHandler';
import { ObjectFormRegistry } from '../webapp/core/ObjectFormRegistry';
import { PropertyInstructionMapper } from '../webapp/core/PropertyInstructionMapper';
import { FormValueProperty } from './FormValueProperty';
import { DynamicFieldObjectFormValue } from './FormValues/DynamicFieldObjectFormValue';
import { ObjectFormValue } from './FormValues/ObjectFormValue';
import { InstructionProperty } from './InstructionProperty';
import { ObjectFormEvent } from './ObjectFormEvent';
import { ObjectFormValueMapperExtension } from './ObjectFormValueMapperExtension';
import { PropertyInstruction } from './PropertyInstruction';
import { RuleResult } from './RuleResult';

export abstract class ObjectFormValueMapper<T extends KIXObject = KIXObject> {

    public object: T;
    public sourceObject: T;
    protected formValues: ObjectFormValue[] = [];
    public form: FormConfiguration;

    protected formFieldOrder: string[] = [];

    public instanceId: string = IdService.generateDateBasedId('ObjectFormValueMapper');
    public extensions: ObjectFormValueMapperExtension[] = [];
    public initialized: boolean = false;

    public formContext: FormContext = FormContext.NEW;

    public constructor(public objectFormHandler: ObjectFormHandler) {
        const extensions = ObjectFormRegistry.getInstance().getObjectFormValueMapperExtensions();

        for (const mapperExtension of extensions) {
            this.extensions?.push(new mapperExtension(this, this.objectFormHandler?.context));
        }
    }

    public destroy(): void {
        for (const mapperExtension of this.extensions || []) {
            mapperExtension.destroy();
        }

        this.extensions = null;

        this.form = null;

        this.destroyFormValues();
        this.formValues = [];
        this.formFieldOrder = [];
    }

    protected destroyFormValues(formValues: ObjectFormValue[] = this.formValues): void {
        const formValueObjectTypes = formValues.filter(
            (fv) => fv.hasOwnProperty('objectType') && (fv as any).objectType?.length > 0
        ).map(((fv) => (fv as any).objectType));
        formValueObjectTypes.forEach((ot) => {
            BrowserCacheService.getInstance().deleteKeys(ot);
        });
        for (const value of formValues) {
            if (value.formValues?.length) {
                this.destroyFormValues(value.formValues);
            }

            value.destroy();
        }
    }

    public async mapFormValues(object: T): Promise<void> {

        for (const mapperExtension of this.extensions || []) {
            const startInitMapper = Date.now();
            await mapperExtension.init();
            const endInitMapper = Date.now();
            console.debug(`Init Mapper Extension (${mapperExtension?.constructor?.name}): ${endInitMapper - startInitMapper}ms`);
        }

        this.object = object;
        const startMapObjectValues = Date.now();
        await this.mapObjectValues(object);
        const endMapObjectValues = Date.now();
        console.debug(`Map Object Values: ${(endMapObjectValues - startMapObjectValues)}ms`);

        await this.mapFormConfiguration();

        const startInitFormValues = Date.now();
        await this.initFormValues();
        await this.initFormValues(undefined, true);
        const endInitFormValues = Date.now();
        console.debug(`Init Form Values: ${endInitFormValues - startInitFormValues}ms`);

        for (const mapperExtension of this.extensions || []) {
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
        const dfFormValue = new DynamicFieldObjectFormValue(KIXObjectProperty.DYNAMIC_FIELDS, object, this, null);
        this.formValues.push(dfFormValue);
        // create from values for existing dynamic field values
        await dfFormValue.createDFFormValues();

        for (const mapperExtension of this.extensions || []) {
            await mapperExtension.mapObjectValues(object);
        }
    }

    protected async initFormValues(formValues = this.formValues, postInit?: boolean): Promise<Promise<void>> {
        for (const fv of formValues.filter((fv) => fv.enabled)) {
            const start = Date.now();

            if (postInit) {
                await fv.postInitFormValue();
            } else {
                await fv.initFormValue();
            }
            const end = Date.now();

            console.debug(`${postInit ? 'Post-' : ''}Init Formvalue (${fv.property} - ${(fv as any).dfName}): ${end - start}ms`);

            if (fv.formValues?.length) {
                await this.initFormValues(fv.formValues, postInit);
            }
        }
    }

    protected setInitialFormValueState(formValues: ObjectFormValue[] = this.formValues): void {
        for (const fv of formValues) {
            fv.setInitialState();

            if (fv.formValues?.length) {
                this.setInitialFormValueState(fv.formValues);
            }
        }
    }

    protected async mapFormConfiguration(): Promise<void> {
        if (Array.isArray(this.form?.pages)) {
            const pages = this.form?.pages?.filter((p) => Array.isArray(p.groups)) || [];
            for (const p of pages) {
                const groups = p.groups?.filter((g) => Array.isArray(g.formFields)) || [];
                for (const g of groups) {
                    await this.mapFormFieldsToValues(this.object, g.formFields);
                }
            }
        }
    }

    public async mapFormFieldsToValues(
        object: T, fields: FormFieldConfiguration[],
        parentField?: FormFieldConfiguration, parentFormValue?: ObjectFormValue
    ): Promise<void> {
        for (const field of fields) {
            if (!parentField) {
                if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                    const nameOption = field.options?.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                    field.property = `${KIXObjectProperty.DYNAMIC_FIELDS}.${nameOption?.value}`;
                }
            }

            const formValue = await this.mapFormField(field, object, parentFormValue);

            if (field.children?.length) {
                await this.mapFormFieldsToValues(object, field.children, field, formValue);
            }
        }
    }

    public async mapFormField(
        field: FormFieldConfiguration, object: T, parentFormValue?: ObjectFormValue
    ): Promise<ObjectFormValue> {
        const startMapFormField = Date.now();

        const formValue = await this.createFormValueForField(field, object, parentFormValue);

        if (formValue) {
            for (const mapperExtension of this.extensions || []) {
                const startExtension = Date.now();
                await mapperExtension.initFormValueByField(field, formValue);
                const endExtension = Date.now();
                console.debug(`mapperExtension (${mapperExtension?.constructor?.name}): ${endExtension - startExtension}ms`);
            }

            const startInit = Date.now();
            await formValue?.initFormValueByField(field);
            formValue.fieldId = field.id;
            formValue.formField = field;
            formValue.description = field.description;
            const endInit = Date.now();
            console.debug(`initFormValueByField (${formValue.property} - ${(formValue as any).dfName}): ${endInit - startInit}ms`);

            const endMapFormField = Date.now();
            console.debug(`mapFormField (${formValue.property}): ${endMapFormField - startMapFormField}ms`);
        } else {
            console.debug(`No FormValue for ${field.property}`);
        }

        return formValue;
    }

    protected async createFormValueForField(
        field: FormFieldConfiguration, object: T, parentFormValue: ObjectFormValue
    ): Promise<ObjectFormValue> {
        const startCreateFormValue = Date.now();
        let formValue: ObjectFormValue;
        if (field.property === KIXObjectProperty.DYNAMIC_FIELDS) {
            const nameOption = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
            if (nameOption) {
                const dfName = nameOption.value;
                const dfValue = await this.getDynamicFieldFormValue(dfName);
                formValue = dfValue?.findFormValue(dfName);
                if (!formValue) {
                    formValue = await dfValue?.createFormValue(dfName);
                    if (!formValue) {
                        console.debug(`No FormValue for ${field.property}: ${dfName}`);
                    }
                }
            }
        } else {
            formValue = this.findFormValue(field.property);
            if (!formValue) {
                formValue = await this.createFormValue(field.property, field, object, parentFormValue);
            }
        }

        if (formValue && parentFormValue) {
            formValue.parent = parentFormValue;
            parentFormValue.formValues.push(formValue);
        }

        const endCreateFormValue = Date.now();
        if (formValue) {
            console.debug(`createFormValue (${formValue.property} - ${(formValue as any).dfName}): ${endCreateFormValue - startCreateFormValue}ms`);
        }

        return formValue;
    }

    protected async createFormValue(
        property: string, field: FormFieldConfiguration, object: T, parentFormValue?: ObjectFormValue
    ): Promise<ObjectFormValue> {
        let formValue: ObjectFormValue;
        if (property.startsWith(KIXObjectType.DYNAMIC_FIELD)) {
            formValue = new DynamicFieldObjectFormValue(property, object, this, parentFormValue);
        }

        for (const mapperExtension of this.extensions || []) {
            formValue = await mapperExtension.createFormValue(property, object);
            if (formValue) {
                break;
            }
        }

        if (!formValue && field?.inputComponent === null) {
            formValue = new ObjectFormValue(field.property, object, this, parentFormValue);
        }

        if (parentFormValue) {
            parentFormValue.formValues.push(formValue);
        } else if (!this.formValues.some((fv) => fv.instanceId === formValue?.instanceId)) {
            this.formValues.push(formValue);
        }

        return formValue;
    }

    public addFormValue(formValue: ObjectFormValue): void {
        this.formValues?.push(formValue);
    }

    public findFormValue<T extends ObjectFormValue = ObjectFormValue>(property: string): T {
        let formValue: ObjectFormValue;
        for (const fv of this.formValues || []) {

            const dfName = KIXObjectService.getDynamicFieldName(property);
            if (!dfName && fv.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                continue;
            }

            formValue = fv.findFormValue(property);

            if (formValue) {
                break;
            }

            if (fv.property === property) {
                formValue = fv;
                break;
            }
        }
        return formValue as T;
    }


    public getFormValues(pageId?: string, groupId?: string): ObjectFormValue[] {
        const formValues = [];
        if (!pageId && !groupId) {
            return [...this.formValues];
        }

        const formFields = this.getFormFields(pageId, groupId) || [];
        for (const field of formFields) {
            let property: string = field.property;
            if (property === KIXObjectProperty.DYNAMIC_FIELDS.toString()) {
                const option = field.options.find((o) => o.option === DynamicFormFieldOption.FIELD_NAME);
                property += `.${option?.value}`;
            }

            const formValue = this.findFormValue(property);
            let configurationFormValue: ObjectFormValue;
            if (formValue && !formValue.isControlledByParent) {
                if (this.objectFormHandler?.configurationMode) {
                    configurationFormValue = this.getConfigurationFormValue(formValue);
                }

                formValues.push(configurationFormValue || formValue);
            }
        }

        return formValues;
    }

    protected getFormFields(pageId: string, groupId: string): FormFieldConfiguration[] {
        let formFields: FormFieldConfiguration[] = [];
        if (pageId && !groupId) {
            const page = this.form?.pages?.find((p) => p.id === pageId);
            if (page.groups.length) {
                page.groups.forEach((group) => {
                    formFields.push(...group.formFields || []);
                });
            }
        } else {
            const page = this.form?.pages?.find((p) => p.id === pageId);
            const group = page?.groups?.find((g) => g.id === groupId);
            formFields = group?.formFields || [];
        }

        return formFields;
    }

    public getConfigurationFormValue(formValue: ObjectFormValue): ObjectFormValue {
        let configurationFormValue: ObjectFormValue;
        for (const extension of this.extensions || []) {
            configurationFormValue = extension.getConfigurationFormValue(formValue);
            if (configurationFormValue) {
                break;
            }
        }
        return configurationFormValue;
    }

    public getNotConfiguredFormValues(): ObjectFormValue[] {
        const fieldIds = FormConfigurationUtil.getConfiguredFieldIds(this.form);
        const formValues: ObjectFormValue[] = this.getFormValuesToShow(fieldIds);
        return formValues;
    }

    protected getFormValuesToShow(
        fieldIds: string[], formValues: ObjectFormValue[] = this.formValues
    ): ObjectFormValue[] {
        const formValuesToShow: ObjectFormValue[] = [];
        for (const fv of formValues) {
            let canShow = fv.showInUI && !fv['COUNT_CONTAINER'];
            canShow = canShow && !fieldIds.some((id) => id === fv.fieldId);

            if (canShow && !fv.isControlledByParent) {
                formValuesToShow.push(fv);
            }

            if (fv.formValues?.length) {
                formValuesToShow.push(...this.getFormValuesToShow(fieldIds, fv.formValues));
            }
        }
        return formValuesToShow;
    }

    public setFormConfiguration(form: FormConfiguration): void {
        this.form = form;
    }

    public async applyWorkflowResult(result: RuleResult): Promise<void> {
        if (this.objectFormHandler?.configurationMode) {
            return;
        }

        const debugRules = Boolean(ClientStorageService.getOption('workflow-debug'));
        if (debugRules) {
            console.debug('FormValues before applyPropertyInstructions:');
            console.debug(this.formValues);
            console.debug('Evaluation Result:');
            console.debug(result);
        }

        await this.applyPropertyInstructions(result);

        if (debugRules) {
            console.debug('FormValues after applyPropertyInstructions:');
            console.debug(this.formValues);
        }

        await this.applyInteractions(result);

        EventService.getInstance().publish(ObjectFormEvent.OTHER_INFORMATION_CHANGED);
    }

    private async applyPropertyInstructions(result: RuleResult): Promise<void> {
        await this.resetFormValues(this.formValues, result.propertyInstructions);

        for (const instruction of result.propertyInstructions) {
            await PropertyInstructionMapper.applyPropertyInstruction(instruction, this)
                .catch((e) => {
                    console.error('Error appling instruction:');
                    console.error(instruction);
                    console.error(e);
                });
        }
    }

    private async applyInteractions(result: RuleResult): Promise<void> {
        if (result.interactions?.length) {
            for (const interaction of result.interactions) {
                await InteractionHandler.handle(interaction);
            }
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

        if (order.some((i) => i === InstructionProperty.COUNT_MAX)) {
            ignoreFormValueProperties.push(FormValueProperty.COUNT_MAX);
        }

        return ignoreFormValueProperties;
    }

    public async getDynamicFieldFormValue(dfName: string): Promise<DynamicFieldObjectFormValue> {
        const dfFormValue = this.findFormValue(KIXObjectProperty.DYNAMIC_FIELDS);
        return dfFormValue as DynamicFieldObjectFormValue;
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