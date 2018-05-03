import { FormDropdownItem, KIXObject } from "@kix/core/dist/model";

export class LinkTicketDialogComponentState<T extends KIXObject> {

    public constructor(
        public linkableObjects: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null,
        public searchResult: T[] = [],
        public loading: boolean = false
    ) { }
}
