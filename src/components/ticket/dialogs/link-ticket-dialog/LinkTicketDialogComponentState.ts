import { FormDropdownItem } from "@kix/core/dist/model";

export class LinkTicketDialogComponentState {

    public constructor(
        public linkableObjects: FormDropdownItem[] = [],
        public currentItem: FormDropdownItem = null
    ) { }
}
