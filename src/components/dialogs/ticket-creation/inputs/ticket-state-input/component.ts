import { STATE_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/browser/ticket";
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from "../../model/ComponentId";

class TicketStateInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            stateId: null,
            ticketStates: []
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
        TicketStore.getStore().dispatch(STATE_ID_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value));
    }

    private setStoreData(): void {
        const creationData = TicketStore.getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.stateId = creationData.stateId;
        }

        const ticketData = TicketStore.getTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
        if (ticketData) {
            this.state.ticketStates = ticketData.states;
        }
    }

}

module.exports = TicketStateInput;
