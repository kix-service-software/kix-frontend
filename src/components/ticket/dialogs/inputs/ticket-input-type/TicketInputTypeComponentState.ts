import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputTypeComponentState extends FormInputComponentState<number> {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null
    ) {
        super();
    }

}
