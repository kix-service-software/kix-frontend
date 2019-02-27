import {
    FormFieldValue, AutoCompleteConfiguration, Form, FormField,
    ValidationSeverity, ValidationResult, IFormInstanceListener
} from ".";
import { FormContext } from "./FormContext";
import { IFormInstance } from "./IFormInstance";
import {
    FormValidationService, ContextService,
    ServiceRegistry, ServiceType
} from "../../../browser";
import { KIXObjectType, KIXObject } from "../../kix";
import { IKIXObjectFormService } from "../../../browser/kix/IKIXObjectFormService";
import { ContextType } from "../context";

export class FormInstance implements IFormInstance {

    private formFieldValues: Map<string, FormFieldValue<any>> = new Map();

    private autoCompleteConfiguration: AutoCompleteConfiguration;

    private listeners: IFormInstanceListener[] = [];

    public constructor(public form: Form) { }

    public async initFormInstance(): Promise<void> {
        await this.initFormFieldValues();
        this.initAutoCompleteConfiguration();
        this.initFormStructure();
    }

    private async initFormFieldValues(): Promise<void> {
        if (this.form) {
            const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                let object: KIXObject;
                if (this.form.formContext === FormContext.EDIT) {
                    const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
                    if (context) {
                        object = await context.getObject();
                    }
                }
                this.formFieldValues = await service.initValues(this.form, object);
            } else {
                this.form.groups.forEach((g) => this.initValues(g.formFields));
            }
        }
    }

    private initValues(formFields: FormField[]): void {
        formFields.forEach((f) => {
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
        this.form.groups.forEach((g) => this.initStructure(g.formFields));
    }

    private initStructure(formFields: FormField[], parent?: FormField): void {
        formFields.forEach((f) => {
            f.parent = parent;
            if (f.children) {
                this.initStructure(f.children, f);
            }
        });
    }

    public getForm(): Form {
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

    public async provideFormField(newFormField: FormField): Promise<void> {
        const parent = await this.getFormField(newFormField.parent.instanceId);
        parent.children.push(newFormField);
        await this.provideFormFieldValue(newFormField.instanceId, null);
    }

    public async removeFormField(formField: FormField, parent?: FormField): Promise<void> {
        let fields: FormField[];
        if (parent) {
            fields = parent.children;
        } else if (formField.parent) {
            parent = await this.getFormField(formField.parent.instanceId);
            fields = parent.children;
        } else {
            const group = this.form.groups.find(
                (g) => g.formFields.some((f) => f.instanceId === formField.instanceId)
            );
            if (group) {
                fields = group.formFields;
            }
        }
        if (Array.isArray(fields)) {
            const index = fields.findIndex((c) => c.instanceId === formField.instanceId);
            fields.splice(index, 1);
            this.formFieldValues.delete(formField.instanceId);
            this.listeners.forEach((l) => l.updateForm());
        }
    }

    public async addFormField(formField: FormField): Promise<void> {
        let fields: FormField[];
        if (formField.parent) {
            const parent = await this.getFormField(formField.parent.instanceId);
            fields = parent.children;
        } else {
            const group = this.form.groups.find(
                (g) => g.formFields.some((f) => f.instanceId === formField.instanceId)
            );
            if (group) {
                fields = group.formFields;
            }
        }
        if (Array.isArray(fields)) {
            const index = fields.findIndex((c) => c.instanceId === formField.instanceId);
            const service = ServiceRegistry.getServiceInstance<IKIXObjectFormService>(
                this.form.objectType, ServiceType.FORM
            );
            if (service) {
                const newField = service.getNewFormField(formField);
                fields.splice(index + 1, 0, newField);
                this.initValues([newField]);
                this.listeners.forEach((l) => l.updateForm());
            }
        }
    }

    public addNewFormField(parent: FormField, newFields: FormField[], clearChildren: boolean = false): void {
        if (parent) {
            if (clearChildren) {
                parent.children.forEach((c) => this.formFieldValues.delete(c.instanceId));
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

    public async provideFormFieldValue<T>(formFieldInstanceId: string, value: T): Promise<void> {
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
        this.listeners.forEach((l) => l.formValueChanged(formField, formFieldValue, oldValue));
        this.listeners.forEach((l) => l.updateForm());
    }

    public getFormFieldValue<T>(formFieldInstanceId: string): FormFieldValue<T> {
        return this.formFieldValues.get(formFieldInstanceId);
    }

    public async getFormFieldValueByProperty<T>(property: string): Promise<FormFieldValue<T>> {
        const iterator = this.getAllFormFieldValues().entries();

        let value = iterator.next();
        while (value.value !== null && value.value !== undefined) {
            const formField = await this.getFormField(value.value[0]);
            if (formField && formField.property === property) {
                return value.value[1];
            }
            value = iterator.next();
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

    public async getFormField(formFieldInstanceId: string): Promise<FormField> {
        for (const g of this.form.groups) {
            const field = this.findFormField(g.formFields, formFieldInstanceId);
            if (field) {
                return field;
            }
        }

        return null;
    }

    public async validateField(field: FormField): Promise<ValidationResult> {
        let result;
        const fieldResult = await FormValidationService.getInstance().validate(field, this.form.id);
        const formFieldValue = this.getFormFieldValue(field.instanceId);
        if (formFieldValue) {
            formFieldValue.valid = fieldResult.findIndex((vr) => vr.severity === ValidationSeverity.ERROR) === -1;
            result = fieldResult;
        }
        return result;
    }

    private findFormField(fields: FormField[], formFieldInstanceId: string): FormField {
        const field = fields.find((f) => f.instanceId === formFieldInstanceId);

        if (!field) {
            for (const f of fields) {
                const foundField = this.findFormField(f.children, formFieldInstanceId);
                if (foundField) {
                    return foundField;
                }
            }
        }

        return field;
    }

    public async validateForm(): Promise<ValidationResult[]> {
        let result = [];

        for (const g of this.form.groups) {
            const groupResult = await this.validateFields(g.formFields);
            result = [...result, ...groupResult];
        }
        this.listeners.forEach((l) => l.updateForm());
        return result;
    }

    private async validateFields(fields: FormField[]): Promise<ValidationResult[]> {
        let result = [];
        for (const field of fields) {
            const fieldResult = await FormValidationService.getInstance().validate(field, this.form.id);
            const formFieldValue = this.getFormFieldValue(field.instanceId);
            if (formFieldValue) {
                formFieldValue.valid = fieldResult.findIndex((vr) => vr.severity === ValidationSeverity.ERROR) === -1;
                result = [...result, ...fieldResult];
                if (field.children) {
                    const childrenResult = await this.validateFields(field.children);
                    result = [...result, ...childrenResult];
                }
            }
        }
        return result;
    }

    public getObjectType(): KIXObjectType {
        return this.form.objectType;
    }

    public getFormContext(): FormContext {
        return this.form.formContext;
    }

}
