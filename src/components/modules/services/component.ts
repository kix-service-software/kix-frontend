import { ServicesComponentState } from './model/ComponentState';
import { ServicesState } from './store/State';
import { SERVICE_INITIALIZE } from './store/actions';

class ServicesComponent {

    public state: ServicesComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new ServicesComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(SERVICE_INITIALIZE());
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const reduxState: ServicesState = this.store.getState();
        if (reduxState.rows) {
            this.state.rows = reduxState.rows;
        }
    }
}

module.exports = ServicesComponent;
