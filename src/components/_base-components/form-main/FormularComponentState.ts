import { Form } from "@kix/core/dist/model";

export class FormComponentState {

    public constructor(
        public formId: string = null,
        public form: Form = null
    ) { }

}
