import { StandardTable } from "@kix/core/dist/browser";
import {
        FormDropdownItem, KIXObject, Ticket, LinkType, LinkTypeDescription, CreateLinkDescription
} from "@kix/core/dist/model";

export class LinkTicketDialogComponentState<T extends KIXObject> {

        public constructor(
                public linkableObjects: FormDropdownItem[] = [],
                public currentLinkableObject: FormDropdownItem = null,
                public standardTable: StandardTable<T> = null,
                public resultCount: number = null,
                public selectedObjects: T[] = [],
                public linkTypes: FormDropdownItem[] = [],
                public currentLinkTypeDescription: LinkTypeDescription = null,
                public currentDropDownItem: FormDropdownItem = null,
                public linkDescriptions: CreateLinkDescription[] = [],
                public successHint: string = null
        ) { }
}
