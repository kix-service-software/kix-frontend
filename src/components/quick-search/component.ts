import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";
import { ComponentRouterStore } from "@kix/core/dist/browser/router/ComponentRouterStore";

export class QuickSearchComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            quickSearchId: 'ticket',
            searchValue: '',
            suggestions: []
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
    }

    private ticketStateChanged(): void {
        const tickets = TicketStore.getInstance().getQuickSearchResult();
        if (tickets) {
            this.state.suggestions = tickets.map((t) => [t.TicketID, t.Title]);
        }
    }

    private searchValueChanged(event: any): void {
        this.state.searchValue = event.target.value;
        if (this.state.searchValue.length >= 4) {
            TicketStore.getInstance().executeQuickSearch(this.state.searchValue);
        }
        console.log('searchValueChanged: ' + event.target.value);
    }

    private navigate(objectId: string): void {
        ComponentRouterStore.getInstance().navigate(
            'base-router', 'ticket-details', { ticketId: objectId }, true, objectId
        );
    }

}

module.exports = QuickSearchComponent;
