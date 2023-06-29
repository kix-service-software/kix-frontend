/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ServiceRegistry } from './ServiceRegistry';
import { ServiceType } from './ServiceType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormValidationService } from './FormValidationService';
import { ValidationSeverity } from './ValidationSeverity';
import { ValidationResult } from './ValidationResult';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core/DynamicFormFieldOption';
import { IdService } from '../../../../model/IdService';
import { FormService } from './FormService';
import { EventService } from './EventService';
import { FormEvent } from './FormEvent';
import { FormValuesChangedEventData } from './FormValuesChangedEventData';
import { FormFactory } from './FormFactory';
import { KIXObjectFormService } from './KIXObjectFormService';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { FormGroupConfiguration } from '../../../../model/configuration/FormGroupConfiguration';
import { ContextService } from './ContextService';
import { Context } from '../../../../model/Context';

export class FormInstance {

    private formFieldValues: Map<string, FormFieldValue<any>> = new Map();
    private fixedValues: Map<string, [FormFieldConfiguration, FormFieldValue<any>]> = new Map();
    private possibleValues: Map<string, FormFieldValue<any>> = new Map();

    private templateValues: Map<string, [FormFieldConfiguration, FormFieldValue<any>]> = new Map();

    private form: FormConfiguration;

    public instanceId: string = IdService.generateDateBasedId('FormInstance');

    public constructor(public context: Context) { }

    public setPossibleValue(property: string, value: FormFieldValue<any>): void {
        this.possibleValues.set(property, value);
        EventService.getInstance().publish(
            FormEvent.POSSIBLE_VALUE_CHANGED, { formInstance: this, property, value }
        );
    }

    public getPossibleValue(property: string): FormFieldValue<any> {
        return this.possibleValues.get(property);
    }

    public provideFixedValue(property: string, value: FormFieldValue, templateField?: FormFieldConfiguration): void {
        this.fixedValues.set(property, [templateField, value]);
        EventService.getInstance().publish(
            FormEvent.FIXED_VALUE_CHANGED, { formInstance: this, property, value }
        );
    }

    public getFixedValues(): Map<string, [FormFieldConfiguration, FormFieldValue<any>]> {
        return this.fixedValues;
    }

    public getTemplateValues(): Map<string, [FormFieldConfiguration, FormFieldValue<any>]> {
        return this.templateValues;
    }

    public provideTemplateValue(
        property: string, value: FormFieldValue, templateField: FormFieldConfiguration
    ): void {
        this.templateValues.set(property, [templateField, value]);
    }

    public async initFormInstance(formId: string, kixObject: KIXObject): Promise<void> {
        this.form = await FormService.getInstance().getForm(formId);
        FormFactory.initForm(this.form);
        await this.initFormFields(kixObject);
    }

    public setFormReadonly(readonly: boolean = true): void {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                this.setGroupReadonly(g, readonly);
            }
        }
    }

    public setGroupReadonly(group: FormGroupConfiguration, readonly: boolean = true): void {
        this.setFieldsReadonly(group.formFields, readonly);
    }

    private setFieldsReadonly(formFields: FormFieldConfiguration[], readonly: boolean = true): void {
        formFields.forEach((f) => {
            f.readonly = readonly;
            EventService.getInstance().publish(FormEvent.FIELD_READONLY_CHANGED, { instanceId: f.instanceId });
            if (Array.isArray(f.children) && f.children.length) {
                this.setFieldsReadonly(f.children, readonly);
            }
        });
    }

    private async initFormFields(kixObject: KIXObject): Promise<void> {
        if (this.form) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                await service.initValues(this.form, this, kixObject);
            } else {
                this.form.pages.forEach(
                    (p) => p.groups.forEach((g) => this.setDefaultValueAndParent(g.formFields))
                );
            }
        }
    }

    public setDefaultValueAndParent(formFields: FormFieldConfiguration[], parent?: FormFieldConfiguration): void {
        formFields.forEach((f) => {
            f.parent = parent;
            f.parentInstanceId = parent?.instanceId;

            if (!f.instanceId) {
                f.instanceId = IdService.generateDateBasedId(f.property);
            }

            if (this.templateValues.has(f.property)) {
                const value = this.templateValues.get(f.property);
                if (Array.isArray(value)) {
                    this.formFieldValues.set(f.instanceId, value[1]);
                    f.visible = value[0].visible;
                    f.readonly = value[0].readonly;
                }
            } else if (this.fixedValues.has(f.property)) {
                const value = this.fixedValues.get(f.property);
                if (Array.isArray(value)) {
                    this.formFieldValues.set(f.instanceId, value[1]);
                    f.visible = value[0] ? value[0].visible : f.visible;
                    f.readonly = true;
                }
            } else {
                this.formFieldValues.set(f.instanceId, f.defaultValue
                    ? new FormFieldValue(f.defaultValue.value, f.defaultValue.valid)
                    : new FormFieldValue(null)
                );
            }

            if (f.children) {
                this.setDefaultValueAndParent(f.children, f);
            }
        });
    }

    public getForm(): FormConfiguration {
        return this.form;
    }

    public hasValues(): boolean {
        const iterator = this.formFieldValues.values();
        let value = iterator.next();
        while (value.value !== null && value.value !== undefined) {
            if (value.value.value !== null && value.value.value !== undefined) {
                return true;
            }
            value = iterator.next();
        }
        return false;
    }

    public async removeFormField(formField: FormFieldConfiguration): Promise<void> {
        if (formField) {
            const fields: FormFieldConfiguration[] = this.getFields(formField);

            if (Array.isArray(fields)) {
                const index = fields.findIndex((c) => c.instanceId === formField?.instanceId);
                if (index !== -1) {
                    fields.splice(index, 1);
                    this.deleteFieldValues(formField);
                    const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                        this.form.objectType, ServiceType.FORM
                    );
                    if (service) {
                        await service.updateFields(fields, this);
                    }

                    EventService.getInstance().publish(FormEvent.FIELD_REMOVED, { formInstance: this, formField });
                }
            }
        }
    }

    public setFieldEmptyState(formField: FormFieldConfiguration, empty: boolean = true): void {
        formField.empty = empty;
        if (empty) {
            // set empty value for DF to delete its values in backend
            if (formField.property === KIXObjectProperty.DYNAMIC_FIELDS) {
                this.formFieldValues.set(formField.instanceId, new FormFieldValue([]));
            } else {
                this.deleteFieldValues(formField);
            }
            this.setFieldChildrenEmpty(formField);
        }

        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
            this.form.objectType, ServiceType.FORM
        );
        service.updateFields([formField], this);

        EventService.getInstance().publish(
            FormEvent.FIELD_EMPTY_STATE_CHANGED, { formInstance: this, field: formField }
        );
    }

    private setFieldChildrenEmpty(formField: FormFieldConfiguration): void {
        if (formField.children) {
            const fields = [];
            for (const child of formField.children) {
                const existingFields = fields.filter((c) => c.property === child.property);
                let fieldCount = existingFields.length;

                if (!fieldCount) {
                    fields.push(child);
                    fieldCount++;
                }

                if (isNaN(child.countDefault) || child.countDefault > fieldCount) {
                    if (!isNaN(child.countDefault) && child.countDefault === 0) {
                        child.empty = true;
                    }
                    fields.push(child);
                }

                this.setFieldChildrenEmpty(child);
            }
            formField.children = fields;
        }
    }

    public async removePages(pageIds: string[], protectedPages: string[] = []): Promise<void> {
        if (!pageIds) {
            pageIds = this.form.pages.map((p) => p.id);
        }

        if (Array.isArray(pageIds)) {
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            for (const pageId of pageIds) {
                if (protectedPages?.some((id) => id === pageId)) {
                    continue;
                }

                pageIds = pageIds
                    .filter((pageId) => !protectedPages.some((id) => id === pageId))
                    .filter((pageId) => this.form.pages.some((p) => p.id === pageId));

                for (const pageId of pageIds) {
                    const index = this.form.pages.findIndex((p) => p.id === pageId);
                    const deletedPage = this.form.pages.splice(index, 1);
                    for (const group of deletedPage[0].groups) {
                        group.formFields?.forEach((f) => this.deleteFieldValues(f));
                        await service?.updateFields(group.formFields, this);
                    }
                }

                EventService.getInstance().publish(FormEvent.FORM_PAGES_REMOVED, { formInstance: this, pageIds });
            }
        }
    }

    public getFields(formField: FormFieldConfiguration): FormFieldConfiguration[] {
        let fields: FormFieldConfiguration[];

        if (formField) {
            if (formField?.parent) {
                const parent = this.getFormField(formField?.parent.instanceId);
                fields = parent.children;
            } else {
                for (const page of this.form.pages) {
                    for (const group of page.groups) {
                        fields = this.findFormFieldList(group.formFields, formField?.instanceId);
                        if (fields) {
                            break;
                        }
                    }
                    if (fields) {
                        break;
                    }
                }
            }
        }
        return fields;
    }

    public async duplicateAndAddNewField(
        formField: FormFieldConfiguration, withChildren: boolean = true
    ): Promise<FormFieldConfiguration> {
        const fields: FormFieldConfiguration[] = this.getFields(formField);
        if (Array.isArray(fields)) {
            const index = fields.findIndex((c) => c.instanceId === formField.instanceId);
            const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                const newField = await service.getNewFormField(this, formField, null, withChildren);
                fields.splice(index + 1, 0, newField);
                this.setDefaultValueAndParent([newField], formField.parent);
                await service.updateFields(fields, this);

                EventService.getInstance().publish(
                    FormEvent.FIELD_DUPLICATED, { formInstance: this, field: newField }
                );

                EventService.getInstance().publish(
                    FormEvent.FIELD_CHILDREN_ADDED, { formInstance: this, parent, field: newField }
                );
                return newField;
            }
        }
        return null;
    }

    public async addNewFieldsAfterField(
        newFormFields: FormFieldConfiguration[], afterField: FormFieldConfiguration
    ): Promise<void> {
        if (Array.isArray(newFormFields) && afterField) {
            const fields: FormFieldConfiguration[] = this.getFields(afterField);
            if (Array.isArray(fields)) {
                let index = fields.findIndex((c) => c.instanceId === afterField.instanceId);

                newFormFields.forEach((c) => {
                    index++;
                    fields.splice(index, 0, c);
                });
                this.setDefaultValueAndParent(newFormFields, afterField.parent);

                EventService.getInstance().publish(
                    FormEvent.FIELD_CHILDREN_ADDED, { formInstance: this, parent: afterField.parent }
                );
            }
        }
    }

    public async addFieldChildren(
        parent: FormFieldConfiguration, children: FormFieldConfiguration[], clearChildren: boolean = false,
        asFirst?: boolean
    ): Promise<void> {
        if (parent) {
            if (!parent.children) {
                parent.children = [];
            }

            if (clearChildren) {
                parent.children.forEach((c) => this.deleteFieldValues(c));
                parent.children = [];
            }

            if (asFirst) {
                // keep first new child as first child
                children.reverse().forEach((f) => parent.children.unshift(f));
            } else {
                children.forEach((f) => parent.children.push(f));
            }
            this.setDefaultValueAndParent(children, parent);

            EventService.getInstance().publish(FormEvent.FIELD_CHILDREN_ADDED, { formInstance: this, parent });
        }
    }

    public addPage(page: FormPageConfiguration, index?: number): void {
        if (page) {

            if (page.groups.length) {
                page.groups.forEach((g) => this.setDefaultValueAndParent(g.formFields));
            }

            if (!isNaN(index)) {
                this.form.pages.splice(index, 0, page);
            } else {
                this.form.pages.push(page);
            }

            EventService.getInstance().publish(FormEvent.FORM_PAGE_ADDED, { formInstance: this, page });
        }
    }

    private deleteFieldValues(formField: FormFieldConfiguration): void {
        this.formFieldValues.delete(formField.instanceId);
        if (formField.children) {
            formField.children.forEach((c) => this.deleteFieldValues(c));
        }
    }

    public async provideFormFieldValuesForProperties(
        values: Array<[string, any]>, originInstanceId: string, silent?: boolean, validate: boolean = true
    ): Promise<void> {
        const instanceValues: Array<[string, any]> = values.map((v) => {
            const formField = this.getFormFieldByProperty(v[0]);
            return [formField ? formField.instanceId : v[0], v[1]];
        });

        await this.provideFormFieldValues(
            instanceValues.filter((iv) => iv[0] !== null), originInstanceId, silent, validate
        );
    }

    public async provideFormFieldValues<T>(
        values: Array<[string, T]>, originInstanceId: string, silent?: boolean, validate: boolean = this.form.validation
    ): Promise<void> {
        const changedFieldValues: Array<[FormFieldConfiguration, FormFieldValue]> = [];
        for (const newValue of values) {
            const instanceId = newValue[0];
            const value = newValue[1];
            if (!this.formFieldValues.has(instanceId)) {
                this.formFieldValues.set(instanceId, new FormFieldValue(value));
            }

            const formFieldValue = this.formFieldValues.get(instanceId);
            formFieldValue.value = value;

            const formField = this.getFormField(instanceId);
            if (validate) {
                const result = await FormValidationService.getInstance().validate(formField, this.form.id, this);
                formFieldValue.valid = true;
                formFieldValue.errorMessages = [];
                result.forEach((r) => {
                    if (r.severity === ValidationSeverity.ERROR) {
                        formFieldValue.valid = false;
                        formFieldValue.errorMessages.push(r.message);
                    }
                });
                EventService.getInstance().publish(FormEvent.FIELD_VALIDATED, formField);
            }
            changedFieldValues.push([formField, formFieldValue]);
        }

        if (!silent) {
            const dialogContext = ContextService.getInstance().getActiveContext();

            if (dialogContext) {
                await dialogContext.setFormObject();
            }

            EventService.getInstance().publish(
                FormEvent.VALUES_CHANGED, new FormValuesChangedEventData(this, changedFieldValues, originInstanceId)
            );

            const valueHandler = FormService.getInstance().getFormFieldValueHandler(this.form.objectType);
            if (valueHandler) {
                for (const handler of valueHandler) {
                    await handler.handleFormFieldValues(this, changedFieldValues);
                }
            }
        }
    }

    public getFormFieldValue<T>(formFieldInstanceId: string): FormFieldValue<T> {
        return this.formFieldValues.get(formFieldInstanceId);
    }

    public async getFormFieldValueByProperty<T>(property: string): Promise<FormFieldValue<T>> {
        const field = await this.getFormFieldByProperty(property);
        if (field) {
            return this.getFormFieldValue(field.instanceId);
        }

        return this.fixedValues.has(property) ? this.fixedValues.get(property)[1] : undefined;
    }

    public getFormFieldByProperty(property: string): FormFieldConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const field = this.findFormFieldByProperty(g.formFields, property);
                if (field) {
                    return field;
                }
            }
        }

        return null;
    }

    public getFormFieldsByProperty(property: string): FormFieldConfiguration[] {
        let fields = [];
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const groupFields = this.findFormFieldsByProperty(g.formFields, property);
                if (Array.isArray(groupFields)) {
                    fields = [...fields, ...groupFields];
                }
            }
        }

        return fields;
    }

    private findFormFieldByProperty(fields: FormFieldConfiguration[] = [], property: string): FormFieldConfiguration {
        let field = fields.find((f) => f.property === property);

        if (!field) {
            const dfName = KIXObjectService.getDynamicFieldName(property);
            if (dfName) {
                field = fields.filter((f) => f.property === KIXObjectProperty.DYNAMIC_FIELDS).find(
                    (f) => f.options && f.options.some(
                        (o) => o.option === DynamicFormFieldOption.FIELD_NAME && o.value === dfName
                    )
                );
            }
        }

        if (!field) {
            for (const f of fields) {
                const foundField = f.children && f.children.length ?
                    this.findFormFieldByProperty(f.children, property) : null;
                if (foundField) {
                    field = foundField;
                    break;
                }
            }
        }

        return field;
    }

    private findFormFieldsByProperty(
        fields: FormFieldConfiguration[] = [], property: string
    ): FormFieldConfiguration[] {
        let resultFields = fields?.filter((f) => f.property === property) || [];

        if (!resultFields?.length) {
            const dfName = KIXObjectService.getDynamicFieldName(property);
            if (dfName) {
                const dfFields = resultFields.filter((f) => f.property === KIXObjectProperty.DYNAMIC_FIELDS).find(
                    (f) => f.options && f.options.some(
                        (o) => o.option === DynamicFormFieldOption.FIELD_NAME && o.value === dfName
                    )
                );
                if (Array.isArray(dfFields)) {
                    resultFields = [...resultFields, ...dfFields];
                }
            }
        }

        if (!resultFields?.length) {
            for (const f of fields) {
                const subFields = this.findFormFieldsByProperty(f.children, property);
                if (subFields?.length) {
                    resultFields = [...resultFields, ...subFields];
                    break;
                }
            }
        }

        return resultFields;
    }

    // TODO: Deprecated
    public getAllFormFieldValues(): Map<string, FormFieldValue<any>> {
        return this.formFieldValues;
    }

    public getFormField(formFieldInstanceId: string): FormFieldConfiguration {
        for (const p of this.form.pages) {
            for (const g of p.groups) {
                const field = this.findFormField(g.formFields, formFieldInstanceId);
                if (field) {
                    return field;
                }
            }
        }

        return null;
    }

    private findFormField(fields: FormFieldConfiguration[], formFieldInstanceId: string): FormFieldConfiguration {
        let field: FormFieldConfiguration;
        if (fields) {
            field = fields.find((f) => f.instanceId === formFieldInstanceId);

            if (!field) {
                for (const f of fields) {
                    const foundField = this.findFormField(f.children, formFieldInstanceId);
                    if (foundField) {
                        return foundField;
                    }
                }
            }
        }

        return field;
    }

    private findFormFieldList(fields: FormFieldConfiguration[], formFieldInstanceId: string): FormFieldConfiguration[] {
        let foundFields: FormFieldConfiguration[];
        if (fields) {
            const field = fields.find((f) => f.instanceId === formFieldInstanceId);

            if (!field) {
                for (const f of fields) {
                    foundFields = this.findFormFieldList(f.children, formFieldInstanceId);
                    if (foundFields) {
                        return foundFields;
                    }
                }
            } else {
                foundFields = fields;
            }
        }

        return foundFields;
    }

    public async validateForm(): Promise<ValidationResult[]> {
        let result = [];

        if (this.form.validation) {
            for (const p of this.form.pages) {
                for (const g of p.groups) {
                    const groupResult = await this.validateFields(g.formFields);
                    result = [...result, ...groupResult];
                }
            }

            EventService.getInstance().publish(FormEvent.FORM_VALIDATED, { formInstance: this, result });
        }
        return result;
    }

    public async validatePage(page: FormPageConfiguration): Promise<ValidationResult[]> {
        let result = [];

        if (page && this.form.validation) {
            for (const g of page.groups) {
                const groupResult = await this.validateFields(g.formFields);
                result = [...result, ...groupResult];
            }

            EventService.getInstance().publish(FormEvent.FORM_PAGE_VALIDATED, { formInstance: this, page, result });
        }
        return result;
    }

    public async validateField(field: FormFieldConfiguration): Promise<ValidationResult[]> {
        let result: ValidationResult[];
        const fieldResult = await FormValidationService.getInstance().validate(field, this.form.id, this);
        const formFieldValue = this.getFormFieldValue(field.instanceId);
        if (formFieldValue) {
            formFieldValue.valid = true;
            formFieldValue.errorMessages = [];
            fieldResult.forEach((r) => {
                if (r.severity === ValidationSeverity.ERROR) {
                    formFieldValue.valid = false;
                    formFieldValue.errorMessages.push(r.message);
                }
            });
            result = fieldResult;
            if ((!field.empty || field.asStructure) && field.children && !!field.children.length) {
                const childrenResult = await this.validateFields(field.children);
                result = [...result, ...childrenResult];
            }
        }

        EventService.getInstance().publish(FormEvent.FIELD_VALIDATED, field);
        return result;
    }

    private async validateFields(fields: FormFieldConfiguration[]): Promise<ValidationResult[]> {
        let result = [];
        for (const field of fields) {
            const r = await this.validateField(field);
            if (Array.isArray(r)) {
                result = [...result, ...r];
            }
        }
        return result;
    }

    public getObjectType(): KIXObjectType | string {
        return this.form.objectType;
    }

    public getFormContext(): FormContext {
        return this.form.formContext;
    }

    public async changeFieldOrder(changeFieldInstanceId: string, targetIndex: number): Promise<void> {
        if (changeFieldInstanceId && !isNaN(targetIndex)) {
            const startField = await this.getFormField(changeFieldInstanceId);
            if (startField) {
                const fields = await this.getFields(startField);
                if (Array.isArray(fields)) {
                    const changeIndex = fields.findIndex((c) => c.instanceId === changeFieldInstanceId);
                    if (changeIndex !== -1 && targetIndex !== changeIndex) {
                        const newIndex = targetIndex > changeIndex ? targetIndex + 1 : targetIndex;
                        const removeIndex = targetIndex < changeIndex ? changeIndex + 1 : changeIndex;
                        fields.splice(newIndex, 0, startField);
                        fields.splice(removeIndex, 1);

                        this.sortValuesByFieldList(fields);

                        const service = ServiceRegistry.getServiceInstance<KIXObjectFormService>(
                            this.form.objectType, ServiceType.FORM
                        );
                        if (service) {
                            await service.updateFields(fields, this);
                        }

                        EventService.getInstance().publish(FormEvent.FORM_FIELD_ORDER_CHANGED, { formInstance: this });
                    }
                }
            }
        }
    }

    private sortValuesByFieldList(fields: FormFieldConfiguration[] = []): void {
        fields.forEach((f) => {
            const value = this.formFieldValues.get(f.instanceId);
            this.formFieldValues.delete(f.instanceId);
            this.formFieldValues.set(f.instanceId, value);
            if (f.children) {
                this.sortValuesByFieldList(f.children);
            }
        });
    }

    public replaceFormField(oldField: FormFieldConfiguration, newField: FormFieldConfiguration): void {
        oldField.options = newField.options;
        oldField.property = newField.property;
        oldField.empty = newField.empty;
        oldField.children = newField.children;
        oldField.hint = newField.hint;
        oldField.instanceId = newField.instanceId;
        oldField.parent = newField.parent;
        oldField.parentInstanceId = newField.parentInstanceId;
        oldField.countDefault = newField.countDefault;
        oldField.countMax = newField.countMax;
        oldField.countMin = newField.countMin;
        oldField.defaultValue = newField.defaultValue;
        oldField.inputComponent = newField.inputComponent;
        oldField.readonly = newField.readonly;
        oldField.asStructure = newField.asStructure;
        oldField.showLabel = newField.showLabel;
    }

    public getAllInvalidFields(): FormFieldConfiguration[] {
        let fields: FormFieldConfiguration[] = [];
        for (const page of this.form.pages) {
            for (const group of page.groups) {
                const invalidFields = this.getInvalidFields(group.formFields);
                fields = [...fields, ...invalidFields];
            }
        }

        return fields;
    }

    public getInvalidFields(fields: FormFieldConfiguration[]): FormFieldConfiguration[] {
        let invalidFields: FormFieldConfiguration[] = [];
        for (const field of fields) {
            const value = this.getFormFieldValue(field.instanceId);
            if (!value?.valid) {
                invalidFields.push(field);
            }

            if (Array.isArray(field.children) && field.children.length) {
                const invalidChilds = this.getInvalidFields(field.children);
                invalidFields = [...invalidFields, ...invalidChilds];
            }
        }

        return invalidFields;
    }

    public getPageIndexforField(instanceId: string): number {
        for (let i = 0; i < this.form.pages.length; i++) {
            for (const group of this.form.pages[i].groups) {
                const field = this.findFormField(group.formFields, instanceId);
                if (field) {
                    return i;
                }
            }
        }

        return -1;
    }

}
