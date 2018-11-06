import { FormInputComponentState } from '@kix/core/dist/model';

export class ComponentState extends FormInputComponentState<string> {

    public constructor(
        public currentValue: Date = null,
        public placeholder: string = null,
        public inputType: string = 'date',
        public dateValue: string = null,
        public timeValue: string = null
    ) {
        super();
    }

}
