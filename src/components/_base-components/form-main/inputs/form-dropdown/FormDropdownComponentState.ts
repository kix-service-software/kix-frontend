import { FormDropdownItem } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

export class FormDropdownComponentState {

    public constructor(
        public items: FormDropdownItem[] = [],
        public filteredItems: FormDropdownItem[] = [],
        public selectedItem: FormDropdownItem = null,
        public expanded: boolean = false,
        public dropdownId: string = IdService.generateDateBasedId(),
        public filterValue: string = null,
        public preSelectedItem: FormDropdownItem = null
    ) { }

}
