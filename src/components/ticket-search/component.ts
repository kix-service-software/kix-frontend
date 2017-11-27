import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";
import { TicketProperties } from "@kix/core/dist/model";

class TicketSearchComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            title: "Ticketsuche",
            searching: false,
            tickets: [],
            time: 0,
            values: {
                TicketNumber: null,
                Title: null
            },
            limit: 100
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
    }

    private limitChanged(event: any): void {
        this.state.limit = event.target.value;
    }

    private searchValueChanged(property: string, event: any): void {
        const value: string = event.target.value;
        this.state.values[property] = value;

        TicketStore.getInstance().prepareSearch('ticket-search', [property, [value]]);
    }

    private searchTickets(): void {
        this.state.searching = true;
        this.state.tickets = [];

        const properties = [
            TicketProperties.TICKET_ID,
            TicketProperties.TICKET_NUMBER,
            TicketProperties.TITLE
        ];

        const start = Date.now();
        TicketStore.getInstance().searchTickets('ticket-search', this.state.limit, properties).then(() => {
            const end = Date.now();
            this.state.time = (end - start) / 1000;
            this.state.searching = false;
        });
    }

    private ticketStateChanged(): void {
        const result = TicketStore.getInstance().getTicketsSearchResult('ticket-search');
        if (result) {
            this.state.tickets = result;
        }
    }

}

module.exports = TicketSearchComponent;
