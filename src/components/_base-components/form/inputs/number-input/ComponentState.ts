import { FormInputComponentState, InputFieldTypes } from '../../../../../core/model';

export class ComponentState extends FormInputComponentState<string> {

    public constructor(
        public currentValue: string = null,
        public placeholder: string = null,
        public min: number = null,
        public max: number = null,
        public step: number = 1,
        public unitstring: string = ''
    ) {
        super();
    }

}
