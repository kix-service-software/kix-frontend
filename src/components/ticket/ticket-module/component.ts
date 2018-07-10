import { TicketsComponentState } from './TicketsComponentState';
import { TicketService } from '@kix/core/dist/browser/ticket';

class TicketsComponent {

    public state: TicketsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketsComponentState();
    }

    public onInput(input: any) {
        this.state.ticketId = Number(input.objectId);
    }

    public onMount(): void {
        if (this.state.ticketId) {
            TicketService.getInstance().openTicket(this.state.ticketId);
        }
    }
}

module.exports = TicketsComponent;
