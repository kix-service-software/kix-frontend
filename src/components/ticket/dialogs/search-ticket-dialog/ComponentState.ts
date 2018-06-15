import { NewTicketDialogContext } from "@kix/core/dist/browser/ticket";

export class ComponentState {

    public constructor(
        public formId: string = 'new-ticket-form',
        public contextId: string = NewTicketDialogContext.CONTEXT_ID,
        public hasSidebars: boolean = false,
        public loading: boolean = false
    ) { }

}
