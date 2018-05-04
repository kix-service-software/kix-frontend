import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputSLAComponentState extends FormInputComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null
    ) {
        super();
    }

}
