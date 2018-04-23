import { FormDropdownItem, AutoCompleteConfiguration } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

export class FormAutoCompleteComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public selectedItem: FormDropdownItem = null,
        public expanded: boolean = false,
        public dropdownId: string = IdService.generateDateBasedId(),
        public searchValue: string = null,
        public preSelectedItem: FormDropdownItem = null,
        public isLoading: boolean = false,
        public autoCompleteConfiguration: AutoCompleteConfiguration = null,
        public searchCallback: (limit: number, searchValue: string) => Promise<FormDropdownItem[]> = null,
    ) { }

}
