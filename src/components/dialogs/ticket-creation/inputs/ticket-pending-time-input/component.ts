import { TicketStore, TicketCreationReduxState } from "@kix/core/dist/model/client/";
import { PENDING_TIME_CHANGED } from '@kix/core/dist/model/client/';

class TicketPendingTimeInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            pendingTime: null
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
        TicketStore.getInstance().getStore().dispatch(PENDING_TIME_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = TicketStore.getInstance().getTicketCreationState();
        this.state.pendingTime = reduxState.pendingTime;
    }

}

module.exports = TicketPendingTimeInput;
