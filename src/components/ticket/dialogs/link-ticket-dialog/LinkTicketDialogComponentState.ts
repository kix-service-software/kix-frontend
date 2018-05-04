import { StandardTable } from "@kix/core/dist/browser";
import { FormDropdownItem, KIXObject, Ticket } from "@kix/core/dist/model";

export class LinkTicketDialogComponentState<T extends KIXObject> {

    public constructor(
        public linkableObjects: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null,
        public searchResult: T[] = [],
        public loading: boolean = false,
        public standardTable: StandardTable<T> = null,
        public resultCount: number = 0
    ) { }
}
