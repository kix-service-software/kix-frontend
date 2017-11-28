import { SearchComponentState } from './model/ComponentState';
import { SearchState } from './store/State';
import { SEARCH_INITIALIZE } from './store/actions';

class SearchComponent {

    public state: SearchComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new SearchComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(SEARCH_INITIALIZE());
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const reduxState: SearchState = this.store.getState();
        if (reduxState.rows) {
            this.state.rows = reduxState.rows;
        }
    }
}

module.exports = SearchComponent;
