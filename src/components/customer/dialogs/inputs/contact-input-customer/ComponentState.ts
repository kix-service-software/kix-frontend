import {
    FormDropdownItem, AutoCompleteConfiguration, FormInputComponentState, Customer
} from "@kix/core/dist/model";

export class ComponentState extends FormInputComponentState<Customer> {

    public constructor(
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public isLoading: boolean = false,
        public customers: Customer[] = [],
        public searchCallback: (limit: number, searchValue: string) => Promise<FormDropdownItem[]> = null,
        public currentItem: FormDropdownItem = null
    ) {
        super();
    }

}
