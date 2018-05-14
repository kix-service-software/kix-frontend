import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputTypeComponentState extends FormInputComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null,
        public primaryCustomerId: string = null,
        public hasContact: boolean = false,
        public invalid: boolean = false
    ) {
        super();
    }

}
