import { FormField, FormDropdownItem, AutoCompleteConfiguration } from "@kix/core/dist/model";

export class TicketInputContactComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public field: FormField = null,
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false
    ) { }

}
