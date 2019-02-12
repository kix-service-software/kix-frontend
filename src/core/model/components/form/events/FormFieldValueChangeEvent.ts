import { FormFieldValue } from "./FormFieldValue";
import { IFormEvent } from ".";
import { FormField } from "..";
import { UpdateFormEvent } from './UpdateFormEvent';

export class FormFieldValueChangeEvent<T = any> extends UpdateFormEvent {

    public constructor(
        public formField: FormField,
        public formFieldValue: FormFieldValue<T>
    ) {
        super();
    }

}
