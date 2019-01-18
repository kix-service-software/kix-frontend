import { FormField } from ".";

export class FormGroup {

    public constructor(
        public name: string,
        public formFields: FormField[],
        public separatorString: string = null
    ) { }

}
