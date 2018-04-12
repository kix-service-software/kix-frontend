import { FormField, FormDropDownItem } from "@kix/core/dist/model";

export class TicketInputPriorityComponentState {

    public constructor(
        public items: FormDropDownItem[] = [],
        public field: FormField = null
    ) { }

}
