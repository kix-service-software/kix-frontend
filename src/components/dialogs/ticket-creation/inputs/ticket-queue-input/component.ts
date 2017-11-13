import { TicketStore, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/";
import { QUEUE_ID_CHANGED } from '@kix/core/dist/model/client/';

class TicketQueueInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            queueId: null,
            queues: []
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
        TicketStore.getInstance().getStore().dispatch(QUEUE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getInstance().getTicketCreationState();
        const processState = TicketStore.getInstance().getTicketDataState();

        this.state.queueId = Number(reduxState.queueId);
        this.state.queues = processState.queues;
    }

}

module.exports = TicketQueueInput;
