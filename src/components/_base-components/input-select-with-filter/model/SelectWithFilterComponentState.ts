import { SelectWithFilterListElement } from '@kix/core/dist/model';

export class SelectWithFilterComponentState {
    public constructor(
        public list: SelectWithFilterListElement[] = [],
        public filterValue: string = '',
        public filteredList: SelectWithFilterListElement[] = []
    ) { }
}
