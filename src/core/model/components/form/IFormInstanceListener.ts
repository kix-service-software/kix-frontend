import { FormField, FormFieldValue } from ".";

export interface IFormInstanceListener {

    formListenerId: string;

    formValueChanged(formField: FormField, value: FormFieldValue<any>, oldValue: any): void;

    updateForm(): void;

}
