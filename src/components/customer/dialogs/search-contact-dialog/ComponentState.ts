import { TicketSearchContext } from "@kix/core/dist/browser/ticket";

export class ComponentState {

    public constructor(
        public formId: string = null,
        public loading: boolean = false
    ) { }

}
