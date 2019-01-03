import { FormField, FormFieldValue } from ".";
import { FormContext } from "./FormContext";

export class FormInputComponentState<T> {

    public fieldId: string = null;

    public field: FormField = null;

    public formId: string = null;

    public defaultValue: FormFieldValue<T> = null;

    public invalid: boolean = false;

    public formContext: FormContext = null;

}
