import { TicketStore, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/";
import { STATE_ID_CHANGED } from '@kix/core/dist/model/client/';

class TicketStateInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            stateId: null,
            ticketStates: []
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
        TicketStore.getInstance().getStore().dispatch(STATE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getInstance().getTicketCreationState();
        const processState = TicketStore.getInstance().getTicketDataState();

        this.state.stateId = reduxState.stateId;
        this.state.ticketStates = processState.states;
    }

}

module.exports = TicketStateInput;
