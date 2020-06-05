/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IFormInstance } from './IFormInstance';
import { FormFieldValue } from '../../../../model/configuration/FormFieldValue';
import { AutoCompleteConfiguration } from '../../../../model/configuration/AutoCompleteConfiguration';
import { IFormInstanceListener } from './IFormInstanceListener';
import { FormConfiguration } from '../../../../model/configuration/FormConfiguration';
import { ServiceRegistry } from './ServiceRegistry';
import { IKIXObjectFormService } from './IKIXObjectFormService';
import { ServiceType } from './ServiceType';
import { FormFieldConfiguration } from '../../../../model/configuration/FormFieldConfiguration';
import { FormValidationService } from './FormValidationService';
import { ValidationSeverity } from './ValidationSeverity';
import { ContextService } from './ContextService';
import { ContextType } from '../../../../model/ContextType';
import { AdditionalContextInformation } from './AdditionalContextInformation';
import { ValidationResult } from './ValidationResult';
import { FormPageConfiguration } from '../../../../model/configuration/FormPageConfiguration';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { FormContext } from '../../../../model/configuration/FormContext';
import { KIXObjectService } from './KIXObjectService';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DynamicFormFieldOption } from '../../../dynamic-fields/webapp/core/DynamicFormFieldOption';
import { IdService } from '../../../../model/IdService';

export class FormInstance implements IFormInstance {

    private formFieldValues: Map<string, FormFieldValue<any>> = new Map();

    private autoCompleteConfiguration: AutoCompleteConfiguration;

    private listeners: IFormInstanceListener[] = [];

    public constructor(public form: FormConfiguration) { }

    public async initFormInstance(): Promise<void> {
        await this.initFormFieldValues();
        this.initAutoCompleteConfiguration();
        this.initFormStructure();
        await this.initFormFieldOptions();
    }

    private async initFormFieldValues(): Promise<void> {
        if (this.form) {
            const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                this.formFieldValues = await service.initValues(this.form);
            } else {
                this.form.pages.forEach(
                    (p) => p.groups.forEach((g) => this.initValues(g.formFields))
                );
            }
        }
    }

    private initValues(formFields: FormFieldConfiguration[]): void {
        formFields.forEach((f) => {
            if (!f.instanceId) {
                f.instanceId = IdService.generateDateBasedId(f.property);
            }
            this.formFieldValues.set(f.instanceId, f.defaultValue
                ? new FormFieldValue(f.defaultValue.value, f.defaultValue.valid)
                : new FormFieldValue(null)
            );

            if (f.children) {
                this.initValues(f.children);
            }
        });
    }

    private initAutoCompleteConfiguration(): void {
        this.autoCompleteConfiguration = this.form && this.form.autoCompleteConfiguration ?
            this.form.autoCompleteConfiguration : new AutoCompleteConfiguration();
    }

    private initFormStructure(): void {
        this.form.pages.forEach(
            (p) => p.groups.forEach((g) => this.initStructure(g.formFields))
        );
    }

    private async initFormFieldOptions(): Promise<void> {
        const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
            this.form.objectType, ServiceType.FORM
        );
        if (service) {
            await service.initOptions(this.form);
        }
    }

    private initStructure(formFields: FormFieldConfiguration[], parent?: FormFieldConfiguration): void {
        formFields.forEach((f) => {
            f.parent = parent;
            if (f.children) {
                this.initStructure(f.children, f);
            }
        });
    }

    public getForm(): FormConfiguration {
        return this.form;
    }

    public registerListener(listener: IFormInstanceListener): void {
        const listenerIndex = this.listeners.findIndex((l) => l.formListenerId === listener.formListenerId);
        if (listenerIndex !== -1) {
            this.listeners[listenerIndex] = listener;
        } else {
            this.listeners.push(listener);
        }
    }

    public removeListener(listenerId: string): void {
        const listenerIndex = this.listeners.findIndex((l) => l.formListenerId === listenerId);
        if (listenerIndex !== -1) {
            this.listeners.splice(listenerIndex, 1);
        }
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

    public async provideFormField(newFormField: FormFieldConfiguration): Promise<void> {
        const parent = await this.getFormField(newFormField.parent.instanceId);
        parent.children.push(newFormField);
        await this.provideFormFieldValue(newFormField.instanceId, null);
    }

    public async removeFormField(formField: FormFieldConfiguration, parent?: FormFieldConfiguration): Promise<void> {
        let fields: FormFieldConfiguration[];
        if (parent) {
            fields = parent.children;
        } else {
            fields = await this.getFields(formField);
        }
        if (Array.isArray(fields)) {
            const index = fields.findIndex((c) => c.instanceId === formField.instanceId);
            fields.splice(index, 1);
            this.deleteValuesRecursive(formField);
            const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                await service.updateFields(fields, this);
            }
            this.listeners.forEach((l) => l.updateForm());
        }
    }

    public setFieldEmptyState(formField: FormFieldConfiguration, empty: boolean = true): void {
        formField.empty = empty;
        if (empty) {
            this.deleteValuesRecursive(formField);
            const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                service.resetChildrenOnEmpty(formField);
            }
        }
    }

    public async removePages(pageIds: string[], protectedPages?: string[]): Promise<void> {
        if (!pageIds) {
            pageIds = this.form.pages.map((p) => p.id);
        }

        if (Array.isArray(pageIds)) {
            const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            for (const pageId of pageIds) {
                if (protectedPages.some((id) => id === pageId)) {
                    continue;
                }

                const index = this.form.pages.findIndex((p) => p.id === pageId);
                if (index !== -1) {
                    const deletedPage = this.form.pages.splice(index, 1);
                    if (deletedPage[0].groups.length) {
                        for (const group of deletedPage[0].groups) {
                            group.formFields.forEach((f) => this.deleteValuesRecursive(f));
                            if (service) {
                                await service.updateFields(group.formFields, this);
                            }
                        }
                    }
                }
            }
            this.listeners.forEach((l) => l.updateForm());
        }
    }

    public async getFields(formField: FormFieldConfiguration): Promise<FormFieldConfiguration[]> {
        let fields: FormFieldConfiguration[];
        if (formField.parent) {
            const parent = await this.getFormField(formField.parent.instanceId);
            fields = parent.children;
        } else {
            for (const page of this.form.pages) {
                const group = page.groups.find(
                    (g) => g.formFields.some((f) => f.instanceId === formField.instanceId)
                );
                if (group) {
                    fields = group.formFields;
                    break;
                }
            }
        }
        return fields;
    }

    public async addFormField(formField: FormFieldConfiguration): Promise<void> {
        const fields: FormFieldConfiguration[] = await this.getFields(formField);
        if (Array.isArray(fields)) {
            const index = fields.findIndex((c) => c.instanceId === formField.instanceId);
            const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                const newField = service.getNewFormField(formField);
                fields.splice(index + 1, 0, newField);
                this.initValues([newField]);
                await service.updateFields(fields, this);
                this.listeners.forEach((l) => l.updateForm());
            }
        }
    }

    public addNewFormField(
        parent: FormFieldConfiguration, newFields: FormFieldConfiguration[], clearChildren: boolean = false
    ): void {
        if (parent) {
            if (!parent.children) {
                parent.children = [];
            }
            if (clearChildren) {
                parent.children.forEach((c) => this.deleteValuesRecursive(c));
                parent.children = [];
            }
            newFields.forEach((f) => {
                f.parent = parent;
                parent.children.push(f);
            });
            this.initValues(newFields);
            this.listeners.forEach((l) => l.updateForm());
        }
    }

    public addPage(page: FormPageConfiguration, index?: number): void {
        if (page) {
            if (page.groups.length) {
                page.groups.forEach((g) => {
                    if (g.formFields.length) {
                        this.initStructure(g.formFields);
                        this.initValues(g.formFields);
                    }
                });
            }
            if (!isNaN(index)) {
                this.form.pages.splice(index, 0, page);
            } else {
                this.form.pages.push(page);
            }
            this.listeners.forEach((l) => l.updateForm());
        }
    }

    private deleteValuesRecursive(formField: FormFieldConfiguration): void {
        this.formFieldValues.delete(formField.instanceId);
        if (formField.children) {
            formField.children.forEach((c) => this.deleteValuesRecursive(c));
        }
    }

    public async provideFormFieldValue<T>(formFieldInstanceId: string, value: T, silent?: boolean): Promise<void> {
        if (!this.formFieldValues.has(formFieldInstanceId)) {
            this.formFieldValues.set(formFieldInstanceId, new FormFieldValue(value));
        }

        const formFieldValue = this.formFieldValues.get(formFieldInstanceId);

        const oldValue = formFieldValue.value;
        formFieldValue.value = value;

        const formField = await this.getFormField(formFieldInstanceId);
        if (this.form.validation) {
            const result = await FormValidationService.getInstance().validate(formField, this.form.id);
            formFieldValue.valid = result.findIndex((vr) => vr.severity === ValidationSeverity.ERROR) === -1;
        }

        const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
            this.form.objectType, ServiceType.FORM
        );
        if (service) {
            await service.updateForm(this, this.form, formField, formFieldValue.value);

            // TODO: not really performant
            const dialogContext = ContextService.getInstance().getActiveContext(ContextType.DIALOG);
            if (dialogContext) {
                const newObject = {};
                const params = await service.prepareFormFields(this.form.id);
                params.forEach((p) => {
                    if (p[1] !== undefined) {
                        newObject[p[0]] = p[1];
                    }
                });

                const formObject = await KIXObjectService.createObjectInstance<any>(this.form.objectType, newObject);
                dialogContext.setAdditionalInformation(AdditionalContextInformation.FORM_OBJECT, formObject);
            }
        }

        if (!silent) {
            this.listeners.forEach((l) => l.formValueChanged(formField, formFieldValue, oldValue));
            this.listeners.forEach((l) => l.updateForm());
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
        return null;
    }

    public async getFormFieldByProperty(property: string): Promise<FormFieldConfiguration> {
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

    public getAutoCompleteConfiguration(): AutoCompleteConfiguration {
        return this.autoCompleteConfiguration;
    }

    public reset(): void {
        this.initFormFieldValues();
    }

    public getAllFormFieldValues(): Map<string, FormFieldValue<any>> {
        return this.formFieldValues;
    }

    public async getFormField(formFieldInstanceId: string): Promise<FormFieldConfiguration> {
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

    public async validateField(field: FormFieldConfiguration): Promise<ValidationResult> {
        let result;
        const fieldResult = await FormValidationService.getInstance().validate(field, this.form.id);
        const formFieldValue = this.getFormFieldValue(field.instanceId);
        if (formFieldValue) {
            formFieldValue.valid = fieldResult.findIndex((vr) => vr.severity === ValidationSeverity.ERROR) === -1;
            result = fieldResult;
        }
        return result;
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

    public async validateForm(): Promise<ValidationResult[]> {
        let result = [];

        if (this.form.validation) {
            for (const p of this.form.pages) {
                for (const g of p.groups) {
                    const groupResult = await this.validateFields(g.formFields);
                    result = [...result, ...groupResult];
                }
            }
            this.listeners.forEach((l) => l.updateForm());
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

            this.listeners.forEach((l) => l.updateForm());
        }
        return result;
    }

    private async validateFields(fields: FormFieldConfiguration[]): Promise<ValidationResult[]> {
        let result = [];
        for (const field of fields) {
            const fieldResult = await FormValidationService.getInstance().validate(field, this.form.id);
            const formFieldValue = this.getFormFieldValue(field.instanceId);
            if (formFieldValue) {
                formFieldValue.valid = fieldResult.findIndex((vr) => vr.severity === ValidationSeverity.ERROR) === -1;
                result = [...result, ...fieldResult];
                if ((!field.empty || field.asStructure) && field.children && !!field.children.length) {
                    const childrenResult = await this.validateFields(field.children);
                    result = [...result, ...childrenResult];
                }
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

                        const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                            this.form.objectType, ServiceType.FORM
                        );
                        if (service) {
                            await service.updateFields(fields, this);
                        }

                        this.listeners.forEach((l) => l.updateForm());
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

}
