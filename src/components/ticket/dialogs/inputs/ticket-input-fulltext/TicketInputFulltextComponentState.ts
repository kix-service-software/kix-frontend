import { FormField, FormDropdownItem, FormInputComponentState } from "@kix/core/dist/model";

export class TicketInputFulltextComponentState extends FormInputComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public currentValue: string = null
    ) {
        super();
    }

}
