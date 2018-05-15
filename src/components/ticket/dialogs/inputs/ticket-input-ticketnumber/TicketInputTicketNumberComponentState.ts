import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputTicketNumberComponentState extends FormInputComponentState<string> {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentValue: string = null
    ) {
        super();
    }

}
