import { FormInputComponentState } from "../../../../../../core/model";

export class ComponentState extends FormInputComponentState<any> {

    public constructor(
        public value: string = '',
        public negate: boolean = false,
        public negateTitle: string = 'Translatable#Negate',
        public valueTitle: string = 'Translatable#Pattern'
    ) {
        super();
    }

}
