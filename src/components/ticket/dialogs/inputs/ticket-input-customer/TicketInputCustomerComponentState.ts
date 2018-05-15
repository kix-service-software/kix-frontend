import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputCustomerComponentState extends FormInputComponentState<number> {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null,
        public primaryCustomerId: string = null,
        public hasContact: boolean = false,
    ) {
        super();
    }

}
