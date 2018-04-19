import { Form, FormInstance } from "@kix/core/dist/model";

export class FormComponentState {

    public constructor(
        public formId: string = null,
        public formInstance: FormInstance = null
    ) { }

}
