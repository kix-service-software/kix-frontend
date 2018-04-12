import { FormField, FormDropDownItem } from "@kix/core/dist/model";

export class TicketInputStateComponentState {

    public constructor(
        public items: FormDropDownItem[] = [],
        public field: FormField = null,
        public pending: boolean = false
    ) { }

}
