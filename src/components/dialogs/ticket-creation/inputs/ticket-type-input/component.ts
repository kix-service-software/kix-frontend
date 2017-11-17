import { TYPE_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';
import { ComponentId } from "../../model/ComponentId";

class TicketTypeInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            typeId: null,
            ticketTypes: [],
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
        TicketStore.getStore().dispatch(TYPE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getTicketCreationState();
        this.state.typeId = Number(reduxState.typeId);

        const ticketData = TicketStore.getTicketData(ComponentId.TICKET_CREATION_DATA_ID);
        if (ticketData) {
            this.state.ticketTypes = ticketData.types;
        }
    }

}

module.exports = TicketTypeInput;
