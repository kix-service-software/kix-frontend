import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { STATE_ID_CHANGED } from '../../store/actions';

class TicketStateInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            stateId: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.stateId = reduxState.stateId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.stateId = reduxState.stateId;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(STATE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketStateInput;
