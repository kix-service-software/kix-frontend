import { QuickSearchStore } from '@kix/core/dist/browser/quick-search/QuickSearchStore';
import { ComponentRouterStore } from "@kix/core/dist/browser/router/ComponentRouterStore";
import { QuickSearchComponentState } from './QuickSearchComponentState';

export class QuickSearchComponent {

    private state: QuickSearchComponentState;

    public onCreate(input: any): void {
        this.state = new QuickSearchComponentState();
    }

    public onMount(): void {
        QuickSearchStore.getInstance().addStateListener(this.quickSearchStateChanged.bind(this));
    }

    private quickSearchStateChanged(): void {
        this.state.quickSearches = QuickSearchStore.getInstance().getQuickSearches();
        if (this.state.quickSearches.length && !this.state.currentQuickSearch) {
            this.state.currentQuickSearch = this.state.quickSearches[0];
        }

        const result = QuickSearchStore.getInstance().getQuickSearchResult();
        if (result) {
            this.state.suggestions = this.buildSuggestionsList(result);
            this.state.searching = false;
            this.state.showSuggestions = true;
        }

        (this as any).setStateDirty("quickSearches");
    }

    private buildSuggestionsList(result: any[]): Array<[string, string]> {
        return result.map((r) => {
            const quickSearch = this.state.currentQuickSearch;
            const id = r[quickSearch.objectIdProperty];
            const displayText =
                quickSearch.displayProperties
                    .map((dp) => r[dp])
                    .join(" ");
            return [id, displayText];
        }) as Array<[string, string]>;
    }

    private quickSearchChanged(event: any): void {
        const quickSearch = this.state.quickSearches.find((qs) => qs.id === event.target.value);
        this.state.currentQuickSearch = quickSearch;
    }

    private searchValueChanged(event: any): void {
        this.state.searchValue = event.target.value;
    }

    private searchClicked(): void {
        if (!this.state.searching) {
            QuickSearchStore.getInstance().executeQuickSearch(this.state.currentQuickSearch.id, this.state.searchValue);
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

        const data = {};
        data[this.state.currentQuickSearch.objectIdProperty] = objectId;

        ComponentRouterStore.getInstance().navigate(
            'base-router', this.state.currentQuickSearch.objectComponent, data, objectId
        );
    }

}

module.exports = QuickSearchComponent;
