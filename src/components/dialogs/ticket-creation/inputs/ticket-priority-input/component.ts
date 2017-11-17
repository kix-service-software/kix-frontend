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
        TicketStore.getStore().dispatch(PRIORITY_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getTicketCreationState();
        this.state.priorityId = Number(reduxState.priorityId);

        const ticketData = TicketStore.getTicketData(ComponentId.TICKET_CREATION_DATA_ID);
        if (ticketData) {
            this.state.ticketPriorities = ticketData.priorities;
        }
    }

}

module.exports = TicketPriorityInput;
