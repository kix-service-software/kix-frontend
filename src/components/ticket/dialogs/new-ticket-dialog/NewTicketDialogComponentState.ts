import { NewTicketDialogContextConfiguration } from "@kix/core/dist/browser/ticket";

export class NewTicketDialogComponentState {

    public constructor(
        public formId: string = 'new-ticket-form',
        public configuration: NewTicketDialogContextConfiguration = null
    ) { }

}
