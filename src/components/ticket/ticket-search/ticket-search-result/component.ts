import { TicketService } from "@kix/core/dist/browser/ticket/TicketService";

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
        TicketService.getInstance().addStateListener('ticket-search-result', this.ticketStateChanged.bind(this));
    }

    private ticketStateChanged(): void {
        const result = TicketService.getInstance().getTicketsSearchResult('ticket-search');
        if (result) {
            this.state.tickets = result;
        }

        const properties = TicketService.getInstance().getTicketsSearchProperties('ticket-search');
        this.state.properties = properties ? properties : [];
    }

}

module.exports = TicketSearchResultComponent;
