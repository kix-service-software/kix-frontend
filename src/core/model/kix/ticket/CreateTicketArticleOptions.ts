import { KIXObjectSpecificCreateOptions } from "../../KIXObjectSpecificCreateOptions";

export class CreateTicketArticleOptions extends KIXObjectSpecificCreateOptions {

    public constructor(
        public ticketId: number
    ) {
        super();
    }

}
