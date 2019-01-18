import { UpdateTicket } from './UpdateTicket';

export class UpdateTicketRequest {

    public Ticket: UpdateTicket;

    public constructor(updateTicket: UpdateTicket) {
        this.Ticket = updateTicket;
    }

}
