export class FormFieldValue<T = any> {

    public constructor(
        public value: T,
        public valid: boolean = true
    ) { }

}
