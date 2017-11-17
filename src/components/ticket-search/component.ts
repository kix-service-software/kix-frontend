import { TicketStore } from "../../../../core/dist/model/client/ticket/store/TicketStore";
import { TicketProperties } from "../../../../core/dist/model/client/ticket/model/TicketProperties";

class TicketSearchComponent {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            title: "Ticketsuche",
            searching: false,
            tickets: [],
            time: 0,
            limit: 100
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.ticketStateChanged.bind(this));
    }

    private limitChanged(event: any): void {
        this.state.limit = event.target.value;
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
        TicketStore.searchTickets('ticket-search', this.state.limit, properties).then(() => {
            const end = Date.now();
            this.state.time = (end - start) / 1000;
            this.state.searching = false;
        });
    }

    private ticketStateChanged(): void {
        const result = TicketStore.getTicketsSearchResult('ticket-search');
        if (result) {
            this.state.tickets = result;
        }
    }

}

module.exports = TicketSearchComponent;
