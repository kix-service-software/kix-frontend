import { CreateTicketState } from './CreateTicketState';

export class CreateTicketStateRequest {

    public TicketState: CreateTicketState;

    public constructor(createTicketstate: CreateTicketState) {
        this.TicketState = createTicketstate;
    }

}
