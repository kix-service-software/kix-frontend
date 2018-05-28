import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class CustomerInputValidCompontentState extends FormInputComponentState<number> {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null
    ) {
        super();
    }

}
