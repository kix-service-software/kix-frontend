import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { AbstractTicketCreationInputComponent } from '../AbstractTicketCreationInputComponent';
import { QUEUE_ID_CHANGED } from '../../store/actions';

class TicketQueueInput extends AbstractTicketCreationInputComponent {

    public onCreate(input: any): void {
        this.state = {
            queueId: null
        };
    }

    public onMount(): void {
        super.initialize(this.stateChanged);
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.queueId = reduxState.queueId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = this.store.getState();
        this.state.queueId = reduxState.queueId;
    }

    public valueChanged(event: any): void {
        this.store.dispatch(QUEUE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketQueueInput;
