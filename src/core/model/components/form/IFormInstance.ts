import { FormFieldValue } from "./events";
import { KIXObject, KIXObjectType } from "../../kix";
import { FormField } from "./FormField";
import { ValidationResult } from "./ValidationResult";
import { IFormInstanceListener } from "./IFormInstanceListener";
import { AutoCompleteConfiguration } from "./AutoCompleteConfiguration";
import { FormContext } from "./FormContext";
import { Form } from "./Form";

export interface IFormInstance {

    provideFormField(newFormField: FormField): Promise<void>;

    removeFormField(formField: FormField, fields?: FormField[]): void;

    addFormField(formField: FormField, fields?: FormField[]): void;

    provideFormFieldValue<T>(formFieldInstanceId: string, value: T): void;

    getFormFieldValue<T>(formFieldInstanceId: string): FormFieldValue<T>;

    getAllFormFieldValues(): Map<string, FormFieldValue<any>>;

    getFormField(formFieldInstanceId: string): Promise<FormField>;

    hasValues(): boolean;

    validateForm(): Promise<ValidationResult[]>;

    getObjectType(): KIXObjectType;

    reset(): void;

    registerListener(listener: IFormInstanceListener): void;

    removeListener(listenerId: string): void;

    getAutoCompleteConfiguration(): AutoCompleteConfiguration;

    getFormContext(): FormContext;

    getForm(): Form;

    validateField(field: FormField): Promise<ValidationResult>;

}
