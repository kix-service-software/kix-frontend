import { IQuickSearch } from '@kix/core/dist/model';

export class QuickSearchComponentState {

    public currentQuickSearch: IQuickSearch = null;

    public searchValue: string = '';

    public suggestions: Array<[string, string]> = [];

    public searching: boolean = false;

    public showSuggestions: boolean = false;

    public quickSearches: IQuickSearch[] = [];

}
