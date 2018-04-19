import { FormField, FormDropdownItem, AutoCompleteConfiguration, Contact } from "@kix/core/dist/model";

export class TicketInputContactComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public field: FormField = null,
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public contacts: Contact[] = []
    ) { }

}
