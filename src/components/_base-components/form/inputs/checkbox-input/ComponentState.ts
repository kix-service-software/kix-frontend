import { FormInputComponentState, ObjectIcon, } from '../../../../../core/model';

export class ComponentState extends FormInputComponentState<any> {

    public constructor(
        public checked: boolean = false
    ) {
        super();
    }
}
