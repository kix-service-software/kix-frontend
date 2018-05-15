import {
    FormField, FormDropdownItem, AutoCompleteConfiguration, Contact, FormInputComponentState
} from "@kix/core/dist/model";

export class TicketInputContactComponentState extends FormInputComponentState<Contact> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public contacts: Contact[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<FormDropdownItem[]> = null,
        public currentItem: FormDropdownItem = null
    ) {
        super();
    }

}
