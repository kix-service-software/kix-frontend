import { TicketStore, TicketCreationReduxState } from "@kix/core/dist/model/client/";
import { CUSTOMER_CHANGED } from '@kix/core/dist/model/client/';

class TicketCustomerInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            customer: null
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(CUSTOMER_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getInstance().getTicketCreationState();
        this.state.customer = reduxState.customer;
    }

}

module.exports = TicketCustomerInput;
