import { CreationTicketStore } from './../../store/index';
import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { PRIORITY_ID_CHANGED } from '../../store/actions';

class TicketPriorityInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            priorityId: null,
            ticketPriorities: [],
            loading: true
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.priorityId = Number(reduxState.priorityId);
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.priorityId = Number(reduxState.priorityId);

        const processState: TicketCreationProcessReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketProcessState;

        this.state.ticketPriorities = processState.priorities;

        this.state.loading = processState.loadTicketData;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(PRIORITY_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketPriorityInput;
