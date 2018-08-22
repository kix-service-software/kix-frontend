import { FormField, FormInputComponentState, InputFieldTypes } from '@kix/core/dist/model';

export class ComponentState extends FormInputComponentState<string> {

    public constructor(
        public currentValue: string = null,
        public placeholder: string = null
    ) {
        super();
    }

}
