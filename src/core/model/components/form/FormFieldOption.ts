import { FormFieldOptions } from ".";
import { FormFieldOptionsForDefaultSelectInput } from "./FormFieldOptionsForDefaultSelectInput";

export class FormFieldOption {

    public constructor(
        public option: FormFieldOptions | string | FormFieldOptionsForDefaultSelectInput,
        public value: string | number | boolean | string[] | number[] | any
    ) { }

}
