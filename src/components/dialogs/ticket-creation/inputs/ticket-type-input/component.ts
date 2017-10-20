import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { TYPE_ID_CHANGED } from '../../store/actions';

class TicketTypeInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            typeId: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.typeId = reduxState.typeId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.typeId = reduxState.typeId;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(TYPE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketTypeInput;
