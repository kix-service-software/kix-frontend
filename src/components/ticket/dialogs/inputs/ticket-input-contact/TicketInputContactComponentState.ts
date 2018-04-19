import {
    FormField, FormDropdownItem, AutoCompleteConfiguration, Contact, FormInputComponentState
} from "@kix/core/dist/model";

export class TicketInputContactComponentState extends FormInputComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public contacts: Contact[] = []
    ) {
        super();
    }

}
