import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';
import { CUSTOMER_ID_CHANGED, TicketCreationReduxState } from '@kix/core/dist/model/client/ticket';

class TicketCustomerIdInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            customerId: null
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getStore().dispatch(CUSTOMER_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getTicketCreationState();
        this.state.customerId = reduxState.customerId;
    }

}

module.exports = TicketCustomerIdInput;
