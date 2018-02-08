import { TicketInfoComponentState } from './model/TicketInfoComponentState';
import { TicketService } from "@kix/core/dist/browser/ticket";
import { TicketUtil } from '@kix/core/dist/browser/ticket/TicketUtil';

class TicketInfoWidgetComponent {

    private state: TicketInfoComponentState;

    public onCreate(input: any): void {
        this.state = new TicketInfoComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.ticketId = Number(input.ticketId);
        this.getTicket();
    }

    public onMount(): void {
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
                this.state.isPending = TicketUtil.isPendingState(this.state.ticket.StateID);
                this.state.isAccountTimeEnabled = TicketUtil.isAccountTimeEnabled();
            }
        }
    }

    private print(): void {
        alert('Drucken ...');
    }

    private edit(): void {
        alert('Bearbeiten ...');
    }

}

module.exports = TicketInfoWidgetComponent;
