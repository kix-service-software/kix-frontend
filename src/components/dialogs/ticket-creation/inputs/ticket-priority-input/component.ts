import { TicketStore, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/";
import { PRIORITY_ID_CHANGED } from '@kix/core/dist/model/client/';

class TicketPriorityInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            priorityId: null,
            ticketPriorities: []
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
        TicketStore.getInstance().getStore().dispatch(PRIORITY_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getInstance().getTicketCreationState();
        const processState: TicketDataReduxState = TicketStore.getInstance().getTicketDataState();

        this.state.priorityId = Number(reduxState.priorityId);
        this.state.ticketPriorities = processState.priorities;
    }

}

module.exports = TicketPriorityInput;
