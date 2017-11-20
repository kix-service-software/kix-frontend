import { SERVICE_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/browser/ticket";
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from "../../model/ComponentId";

class TicketServiceInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            serviceId: null,
            services: []
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
        TicketStore.getInstance().getStore().dispatch(
            SERVICE_ID_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value)
        );
    }

    private setStoreData(): void {
        const creationData = TicketStore.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.serviceId = creationData.serviceId;
        }

        const ticketData = TicketStore.getInstance().getTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
        if (ticketData) {
            this.state.services = ticketData.services;
        }
    }

}

module.exports = TicketServiceInput;
