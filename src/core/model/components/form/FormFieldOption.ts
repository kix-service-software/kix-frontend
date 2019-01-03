import { FormFieldOptions } from ".";

export class FormFieldOption {

    public constructor(
        public option: FormFieldOptions | string,
        public value: string | number | boolean | string[] | number[] | any
    ) { }

}
