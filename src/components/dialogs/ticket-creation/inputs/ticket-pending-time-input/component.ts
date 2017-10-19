import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { PENDING_TIME_CHANGED } from '../../store/actions';

class TicketPendingTimeInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            pendingTime: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.pendingTime = reduxState.pendingTime;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.pendingTime = reduxState.pendingTime;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(PENDING_TIME_CHANGED(event.target.value));
    }

}

module.exports = TicketPendingTimeInput;
