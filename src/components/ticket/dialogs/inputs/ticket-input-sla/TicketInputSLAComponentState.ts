import { FormField, FormDropdownItem } from "@kix/core/dist/model";

export class TicketInputSLAComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public field: FormField = null
    ) { }

}
