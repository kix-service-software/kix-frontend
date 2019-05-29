import { FormField, FormFieldValue } from ".";
import { FormContext } from "./FormContext";
import { AbstractComponentState } from "../../../browser/components/AbstractComponentState";

export class FormInputComponentState<T> extends AbstractComponentState {

    public constructor(
        public fieldId: string = null,
        public field: FormField = null,
        public formId: string = null,
        public defaultValue: FormFieldValue<T> = null,
        public invalid: boolean = false,
        public formContext: FormContext = null
    ) {
        super();
    }

}
