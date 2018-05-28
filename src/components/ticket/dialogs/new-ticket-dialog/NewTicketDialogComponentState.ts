import { NewTicketDialogContextConfiguration, NewTicketDialogContext } from "@kix/core/dist/browser/ticket";
import { KIXObjectType } from "@kix/core/dist/model";

export class NewTicketDialogComponentState {

    public constructor(
        public formId: string = 'new-ticket-form',
        public objectType: KIXObjectType = KIXObjectType.TICKET,
        public contextId: string = NewTicketDialogContext.CONTEXT_ID,
        public hasSidebars: boolean = false,
        public loading: boolean = false
    ) { }

}
