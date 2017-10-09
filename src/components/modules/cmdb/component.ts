import { CMDBComponentState } from './model/ComponentState';
import { CMDBState } from './store/State';
import { TICKET_INITIALIZE } from './store/actions';

class CMDBComponent {

    public state: CMDBComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new CMDBComponentState();
        this.state.configurationMode = input.configurationMode;
    }

    public onMount(): void {
        this.store = require('./store/');
        this.store.subscribe(this.stateChanged.bind(this));
        this.store.dispatch(TICKET_INITIALIZE());
    }

    public onInput(input: any) {
        this.state.configurationMode = input.configurationMode;
    }

    public stateChanged(): void {
        const reduxState: CMDBState = this.store.getState();
        if (reduxState.containerConfiguration) {
            this.state.containerConfiguration = reduxState.containerConfiguration;
        }
    }
}

module.exports = CMDBComponent;
