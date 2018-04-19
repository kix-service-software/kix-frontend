import { FormField, FormDropdownItem } from "@kix/core/dist/model";

export class TicketInputTypeComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public field: FormField = null,
        public hasContact: boolean = false
    ) { }

}
