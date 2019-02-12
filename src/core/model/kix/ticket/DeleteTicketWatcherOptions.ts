import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class DeleteTicketWatcherOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public ticketId: number
    ) {
        super();
    }

}
