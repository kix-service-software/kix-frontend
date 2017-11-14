import {
    PRIORITY_ID_CHANGED,
    TicketCreationReduxState,
    TicketDataReduxState
} from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

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
        const processState: TicketDataReduxState = TicketStore.getTicketDataState();

        this.state.priorityId = Number(reduxState.priorityId);
        this.state.ticketPriorities = processState.priorities;
    }

}

module.exports = TicketPriorityInput;
