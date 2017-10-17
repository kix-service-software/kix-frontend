import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { CUSTOMER_ID_CHANGED } from '../../store/actions';

class TicketCustomerIdInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            isLoading: false
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        console.log("stateChanged");
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.isLoading = reduxState.loadCustomerId;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(CUSTOMER_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketCustomerIdInput;
