import { FAQComponentState } from './model/ComponentState';
import { FAQState } from './store/State';
import { FAQ_INITIALIZE } from './store/actions';

class FAQComponent {

    public state: FAQComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new FAQComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(FAQ_INITIALIZE());
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const reduxState: FAQState = this.store.getState();
        if (reduxState.containerConfiguration) {
            this.state.containerConfiguration = reduxState.containerConfiguration;
        }
    }
}

module.exports = FAQComponent;
