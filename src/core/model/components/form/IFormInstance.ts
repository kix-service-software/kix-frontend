/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../kix";
import { ValidationResult } from "./ValidationResult";
import { IFormInstanceListener } from "./IFormInstanceListener";
import { AutoCompleteConfiguration } from "./AutoCompleteConfiguration";
import { FormContext } from "./FormContext";
import { FormFieldConfiguration, FormConfiguration } from "./configuration";
import { FormFieldValue } from "./events";

export interface IFormInstance {

    provideFormField(newFormFieldConfiguration: FormFieldConfiguration): Promise<void>;

    removeFormField(FormFieldConfiguration: FormFieldConfiguration, parent?: FormFieldConfiguration): void;

    addFormField(FormFieldConfiguration: FormFieldConfiguration, fields?: FormFieldConfiguration[]): void;

    provideFormFieldValue<T>(FormFieldConfigurationInstanceId: string, value: T, silent?: boolean): void;

    getFormFieldValue<T>(FormFieldConfigurationInstanceId: string): FormFieldValue<T>;

    getFormFieldValueByProperty<T>(property: string): Promise<FormFieldValue<T>>;

    getFormFieldByProperty(property: string): Promise<FormFieldConfiguration>;

    getAllFormFieldValues(): Map<string, FormFieldValue<any>>;

    getFormField(FormFieldConfigurationInstanceId: string): Promise<FormFieldConfiguration>;

    hasValues(): boolean;

    validateForm(): Promise<ValidationResult[]>;

    getObjectType(): KIXObjectType;

    reset(): void;

    registerListener(listener: IFormInstanceListener): void;

    removeListener(listenerId: string): void;

    getAutoCompleteConfiguration(): AutoCompleteConfiguration;

    getFormContext(): FormContext;

    getForm(): FormConfiguration;

    validateField(field: FormFieldConfiguration): Promise<ValidationResult>;

    addNewFormField(
        parent: FormFieldConfiguration, newFields: FormFieldConfiguration[], clearChildren?: boolean
    ): void;

}
