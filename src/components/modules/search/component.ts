import { SearchComponentState } from './model/ComponentState';

class SearchComponent {

    public state: SearchComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new SearchComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

}

module.exports = SearchComponent;
