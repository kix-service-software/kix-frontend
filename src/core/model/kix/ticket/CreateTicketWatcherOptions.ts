import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class CreateTicketWatcherOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public ticketId: number,
        public userId: number
    ) {
        super();
    }

}
