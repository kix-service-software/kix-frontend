import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { CUSTOMER_CHANGED } from '../../store/actions';

class TicketCustomerInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            customer: null
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(CUSTOMER_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        this.state.customer = reduxState.customer;
    }

}

module.exports = TicketCustomerInput;
