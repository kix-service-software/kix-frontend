import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputPriorityComponentState extends FormInputComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null
    ) {
        super();
    }

}
