import { QuickSearchStore } from '@kix/core/dist/browser/quick-search/QuickSearchStore';
import { ComponentRouterStore } from "@kix/core/dist/browser/router/ComponentRouterStore";

export class QuickSearchComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            quickSearchId: 'ticket',
            searchValue: '',
            suggestions: [],
            searching: false,
            showSuggestions: false,
            quickSearches: []
        };
    }

    public onMount(): void {
        QuickSearchStore.getInstance().addStateListener(this.quickSearchStateChanged.bind(this));
        this.state.quickSearches = QuickSearchStore.getInstance().getQuickSearches();
    }

    private quickSearchStateChanged(): void {
        this.state.quickSearches = QuickSearchStore.getInstance().getQuickSearches();

        const result = QuickSearchStore.getInstance().getQuickSearchResult();
        if (result) {
            // TODO: mapping object attributes from IQuickSearch
            this.state.suggestions = result.map((r) => [r['TicketID'], r['Title']]);
            this.state.searching = false;
            this.state.showSuggestions = true;
        }

        (this as any).setStateDirty("quickSearches");
    }

    private quickSearchChanged(event: any): void {
        this.state.quickSearchId = event.target.value;
    }

    private searchValueChanged(event: any): void {
        this.state.searchValue = event.target.value;
    }

    private searchClicked(): void {
        if (!this.state.searching) {
            QuickSearchStore.getInstance().executeQuickSearch(this.state.quickSearchId, this.state.searchValue);
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
        ComponentRouterStore.getInstance().navigate(
            'base-router', 'ticket-details', { ticketId: objectId }, true, objectId
        );
    }

}

module.exports = QuickSearchComponent;
