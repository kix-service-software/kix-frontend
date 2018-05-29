import { FormField } from '@kix/core/dist/model';

export class FormTextInputComponentState {

    public constructor(
        public formField: FormField = null,
        public currentValue: string = null,
        public invalid: boolean = false,
        public formId: string = null,
        public placeholder: string = null
    ) { }

}
