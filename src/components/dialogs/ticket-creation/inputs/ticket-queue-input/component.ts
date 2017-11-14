import { QUEUE_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

class TicketQueueInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            queueId: null,
            queues: []
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
        TicketStore.getStore().dispatch(QUEUE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getTicketCreationState();
        const ticketDataState = TicketStore.getTicketDataState();

        this.state.queueId = Number(reduxState.queueId);
        this.state.queues = ticketDataState.queues;
    }

}

module.exports = TicketQueueInput;
