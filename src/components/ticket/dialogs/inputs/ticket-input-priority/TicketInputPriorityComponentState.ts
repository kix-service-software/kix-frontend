import { FormField, FormDropdownItem } from "@kix/core/dist/model";

export class TicketInputPriorityComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public field: FormField = null
    ) { }

}
