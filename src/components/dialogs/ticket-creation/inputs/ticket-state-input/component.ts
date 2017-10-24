import { CreationTicketStore } from './../../store/index';
import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { STATE_ID_CHANGED } from '../../store/actions';

class TicketStateInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            stateId: null,
            ticketStates: [],
            loading: true
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.stateId = reduxState.stateId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.stateId = reduxState.stateId;

        const processState: TicketCreationProcessReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketProcessState;

        this.state.ticketStates = processState.states;

        this.state.loading = processState.loadTicketData;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(STATE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketStateInput;
