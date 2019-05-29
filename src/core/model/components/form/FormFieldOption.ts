import { FormFieldOptions } from ".";
import { DefaultSelectInputFormOption } from "./DefaultSelectInputFormOption";

export class FormFieldOption {

    public constructor(
        public option: FormFieldOptions | string | DefaultSelectInputFormOption,
        public value: string | number | boolean | string[] | number[] | any
    ) { }

}
