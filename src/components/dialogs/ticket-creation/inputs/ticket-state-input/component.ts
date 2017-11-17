import { STATE_ID_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

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

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getStore().dispatch(STATE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState = TicketStore.getTicketCreationState();
        const processState = TicketStore.getTicketDataState();

        this.state.stateId = reduxState.stateId;
        this.state.ticketStates = processState.states;
    }

}

module.exports = TicketStateInput;
