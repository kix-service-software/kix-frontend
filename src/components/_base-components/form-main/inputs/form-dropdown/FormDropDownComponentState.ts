import { FormDropDownItem } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

export class FormDropDownComponentState {

    public constructor(
        public items: FormDropDownItem[] = [],
        public filteredItems: FormDropDownItem[] = [],
        public selectedItem: FormDropDownItem = null,
        public expanded: boolean = false,
        public dropdownId: string = IdService.generateDateBasedId(),
        public filterValue: string = null
    ) { }

}
