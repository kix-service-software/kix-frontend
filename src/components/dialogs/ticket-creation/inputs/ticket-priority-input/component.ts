import {
    PRIORITY_ID_CHANGED,
    TicketCreationReduxState,
    TicketDataReduxState
} from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';
import { ComponentId } from "../../model/ComponentId";


class TicketPriorityInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            priorityId: null,
            ticketPriorities: []
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
        TicketStore.getStore().dispatch(PRIORITY_ID_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value));
    }

    private setStoreData(): void {
        const creationData = TicketStore.getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.priorityId = Number(creationData.priorityId);
        }

        const ticketData = TicketStore.getTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
        if (ticketData) {
            this.state.ticketPriorities = ticketData.priorities;
        }
    }

}

module.exports = TicketPriorityInput;
