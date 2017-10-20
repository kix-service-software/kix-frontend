import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { PRIORITY_ID_CHANGED } from '../../store/actions';

class TicketPriorityInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            priorityId: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.priorityId = reduxState.priorityId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.priorityId = reduxState.priorityId;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(PRIORITY_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketPriorityInput;
