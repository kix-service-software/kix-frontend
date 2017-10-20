import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { CUSTOMER_ID_CHANGED } from '../../store/actions';

class TicketCustomerIdInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            customerId: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.customerId = reduxState.customerId;
    }

    public stateChanged(): void {
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.customerId = reduxState.customerId;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(CUSTOMER_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketCustomerIdInput;
