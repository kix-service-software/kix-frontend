import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { CUSTOMER_CHANGED } from '../../store/actions';

class TicketCustomerInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            customer: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.customer = reduxState.customer;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState().ticketState;
        this.state.customer = reduxState.customer;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(CUSTOMER_CHANGED(event.target.value));
    }

}

module.exports = TicketCustomerInput;
