import { CreateTicketPriority } from './CreateTicketPriority';

export class CreateTicketPriorityRequest {

    public Priority: CreateTicketPriority;

    public constructor(createTicketPriority: CreateTicketPriority) {
        this.Priority = createTicketPriority;
    }

}
