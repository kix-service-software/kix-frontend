import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class ComponentState extends FormInputComponentState<string> {

    public constructor(
        public currentValue: string = null
    ) {
        super();
    }

}
