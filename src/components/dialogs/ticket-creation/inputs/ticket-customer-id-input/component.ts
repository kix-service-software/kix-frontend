import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { CUSTOMER_ID_CHANGED } from '../../store/actions';

class TicketCustomerIdInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            customerId: null
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(CUSTOMER_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        this.state.customerId = reduxState.customerId;
    }

}

module.exports = TicketCustomerIdInput;
