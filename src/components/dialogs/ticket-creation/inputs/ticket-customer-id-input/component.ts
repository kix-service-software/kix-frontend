import { TicketStore, TicketCreationReduxState } from "@kix/core/dist/model/client/";
import { CUSTOMER_ID_CHANGED } from '@kix/core/dist/model/client/';

class TicketCustomerIdInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            customerId: null
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(CUSTOMER_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getInstance().getTicketCreationState();
        this.state.customerId = reduxState.customerId;
    }

}

module.exports = TicketCustomerIdInput;
