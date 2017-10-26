import { CreationTicketStore } from './../../store/index';
import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { STATE_ID_CHANGED } from '../../store/actions';

class TicketStateInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            stateId: null,
            ticketStates: []
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.stateId = reduxState.stateId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(STATE_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        const processState: TicketCreationProcessReduxState = CreationTicketStore.getInstance().getProcessState();

        this.state.stateId = reduxState.stateId;
        this.state.ticketStates = processState.states;
    }

}

module.exports = TicketStateInput;
