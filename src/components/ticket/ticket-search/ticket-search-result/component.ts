import { TicketService } from "@kix/core/dist/browser/ticket/TicketService";
import { ContextNotification, ContextService } from "@kix/core/dist/browser/context";

export class TicketSearchResultComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            tickets: [],
            properties: []
        };
    }

    public onInput(input: any): void {
        this.state.properties = input.properties;
    }

    public onMount(): void {
        ContextService.getInstance().addStateListener(this.contextServiceNotified.bind(this));
        TicketService.getInstance().addStateListener(this.ticketStateChanged.bind(this));
    }

    private contextServiceNotified(id: string, type: ContextNotification, ...args): void {
        if (id === 'ticket-search') {
            this.state.tickets = args[0];
        }
    }

    private ticketStateChanged(): void {
        const properties = TicketService.getInstance().getTicketsSearchProperties('ticket-search');
        this.state.properties = properties ? properties : [];
    }

}

module.exports = TicketSearchResultComponent;
