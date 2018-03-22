export class QuickSearchComponentState {

    public searchValue: string = '';

    public suggestions: Array<[string, string]> = [];

    public searching: boolean = false;

    public showSuggestions: boolean = false;

}
