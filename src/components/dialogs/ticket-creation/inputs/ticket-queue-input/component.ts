import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { QUEUE_ID_CHANGED } from '../../store/actions';

class TicketQueueInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            queueId: null
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.queueId = reduxState.queueId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.queueId = reduxState.queueId;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(QUEUE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketQueueInput;
