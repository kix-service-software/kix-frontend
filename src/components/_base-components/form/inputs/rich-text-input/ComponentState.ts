import { FormInputComponentState } from '../../../../../core/model';

export class ComponentState extends FormInputComponentState<string> {

    public constructor(
        public currentValue: string = null
    ) {
        super();
    }

}
