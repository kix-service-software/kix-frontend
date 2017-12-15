import { TicketStore } from "@kix/core/dist/browser/ticket/TicketStore";
import { ComponentRouterStore } from "@kix/core/dist/browser/router/ComponentRouterStore";

export class QuickSearchComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            quickSearchId: 'ticket',
            searchValue: '',
            suggestions: [],
            searching: false,
            showSuggestions: false
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.ticketStateChanged.bind(this));
    }

    private ticketStateChanged(): void {
        const tickets = TicketStore.getInstance().getQuickSearchResult();
        if (tickets) {
            this.state.suggestions = tickets.map((t) => [t.TicketID, t.Title]);
            this.state.searching = false;
            this.state.showSuggestions = true;
        }
    }

    private searchValueChanged(event: any): void {
        this.state.searchValue = event.target.value;
        if (this.state.searchValue.length >= 4) {
            TicketStore.getInstance().executeQuickSearch(this.state.searchValue);
            this.state.searching = true;
            this.state.showSuggestions = false;
        }
    }

    private searchInputClicked(): void {
        if (!this.state.searching) {
            this.state.showSuggestions = true;
        }
    }

    private navigate(objectId: string): void {
        this.state.showSuggestions = false;
        (this as any).setStateDirty('showSuggestions');
        ComponentRouterStore.getInstance().navigate(
            'base-router', 'ticket-details', { ticketId: objectId }, true, objectId
        );
    }

}

module.exports = QuickSearchComponent;
