import { UpdateTicketPriority } from './UpdateTicketPriority';

export class UpdateTicketPriorityRequest {

    public Priority: UpdateTicketPriority;

    public constructor(updateTicketPriority: UpdateTicketPriority) {
        this.Priority = updateTicketPriority;
    }

}
