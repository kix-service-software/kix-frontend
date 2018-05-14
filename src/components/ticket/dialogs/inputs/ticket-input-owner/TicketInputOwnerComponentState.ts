import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputOwnerComponentState extends FormInputComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null,
        public invalid: boolean = false
    ) {
        super();
    }

}
