import { CreateTicket } from '.';

export class CreateTicketRequest {

    public Ticket: CreateTicket;

    public constructor(createTicket: CreateTicket) {
        this.Ticket = createTicket;
    }

}
