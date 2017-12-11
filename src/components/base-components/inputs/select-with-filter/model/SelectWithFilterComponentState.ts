import { SelectWithFilterListElement } from '@kix/core/dist/browser/model';

export class SelectWithFilterComponentState {
    public constructor(
        public list: SelectWithFilterListElement[] = [],
        public filterValue: string = '',
        public filteredList: SelectWithFilterListElement[] = []
    ) { }
}
