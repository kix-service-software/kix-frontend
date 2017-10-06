import { TicketsComponentState } from './model/TicketsComponentState';
import { TicketsState } from './store/TicketState';
import { TICKET_INITIALIZE } from './store/actions';

class TicketsComponent {

    public state: TicketsComponentState;

    public store: any;

    public onCreate(input: any): void {
        this.state = new TicketsComponentState();
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
        const reduxState: TicketsState = this.store.getState();
        if (reduxState.containerConfiguration) {
            this.state.containerConfiguration = reduxState.containerConfiguration;
        }
    }
}

module.exports = TicketsComponent;
