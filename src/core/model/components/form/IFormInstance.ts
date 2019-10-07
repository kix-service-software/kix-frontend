/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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

    removeFormField(formField: FormField, parent?: FormField): void;

    addFormField(formField: FormField, fields?: FormField[]): void;

    provideFormFieldValue<T>(formFieldInstanceId: string, value: T, silent?: boolean): void;

    getFormFieldValue<T>(formFieldInstanceId: string): FormFieldValue<T>;

    getFormFieldValueByProperty<T>(property: string): Promise<FormFieldValue<T>>;

    getFormFieldByProperty(property: string): Promise<FormField>;

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

    addNewFormField(parent: FormField, newFields: FormField[], clearChildren?: boolean): void;

}
