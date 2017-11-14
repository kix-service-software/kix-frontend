import { SERVICE_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

class TicketServiceInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            serviceId: null
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
        TicketStore.getStore().dispatch(SERVICE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getTicketCreationState();
        this.state.serviceId = reduxState.serviceId;
    }

}

module.exports = TicketServiceInput;
