import { CreationTicketStore } from './../../store/index';
import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { PRIORITY_ID_CHANGED } from '../../store/actions';

class TicketPriorityInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            priorityId: null,
            ticketPriorities: []
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(state: TicketCreationReduxState): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(PRIORITY_ID_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        const processState: TicketCreationProcessReduxState = CreationTicketStore.getInstance().getProcessState();

        this.state.priorityId = Number(reduxState.priorityId);
        this.state.ticketPriorities = processState.priorities;
    }

}

module.exports = TicketPriorityInput;
