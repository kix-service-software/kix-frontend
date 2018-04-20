import {
    FormField, FormDropdownItem, AutoCompleteConfiguration, Contact, FormInputComponentState
} from "@kix/core/dist/model";

export class TicketInputContactComponentState extends FormInputComponentState {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public contacts: Contact[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<FormDropdownItem[]> = null
    ) {
        super();
    }

}
