import { CUSTOMER_CHANGED, TicketCreationReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

class TicketCustomerInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            customer: null
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getStore().dispatch(CUSTOMER_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getTicketCreationState();
        this.state.customer = reduxState.customer;
    }

}

module.exports = TicketCustomerInput;
