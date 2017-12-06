import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";

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
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
    }

    private ticketStateChanged(): void {
        const result = TicketStore.getInstance().getTicketsSearchResult('ticket-search');
        if (result) {
            this.state.tickets = result;
        }

        const properties = TicketStore.getInstance().getTicketsSearchProperties('ticket-search');
        this.state.properties = properties ? properties : [];
    }

}

module.exports = TicketSearchResultComponent;
