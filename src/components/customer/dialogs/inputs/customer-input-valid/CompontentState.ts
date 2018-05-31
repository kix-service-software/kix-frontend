import { FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class CompontentState extends FormInputComponentState<number> {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null
    ) {
        super();
    }

}
