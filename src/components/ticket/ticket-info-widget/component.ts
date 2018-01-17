import { TicketInfoComponentState } from './model/TicketInfoComponentState';
import { TicketService } from "@kix/core/dist/browser/ticket";

class TicketInfoWidgetComponent {

    private state: TicketInfoComponentState;

    public onCreate(input: any): void {
        this.state = new TicketInfoComponentState();
    }
    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = input.ticketId;
        this.getTicket();
    }

    public onMount(): void {
        // TicketService.getInstance().addServiceListener(this.state.instanceId, this.ticketStateChanged.bind(this));
        this.getTicket();
    }

    private ticketStateChanged(): void {
        this.getTicket();
    }

    private getTicket(): void {
        if (this.state.ticketId) {
            const ticketDetails = TicketService.getInstance().getTicketDetails(this.state.ticketId);
            if (ticketDetails) {
                this.state.ticket = ticketDetails.ticket;
            }
        }
    }
}

module.exports = TicketInfoWidgetComponent;
