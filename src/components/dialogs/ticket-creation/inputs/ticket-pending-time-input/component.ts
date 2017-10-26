import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { PENDING_TIME_CHANGED } from '../../store/actions';

class TicketPendingTimeInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            pendingTime: null
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
        CreationTicketStore.getInstance().getStore().dispatch(PENDING_TIME_CHANGED(event.target.value));
    }

    private setStoreData(): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.getInstance().getTicketState();
        this.state.pendingTime = reduxState.pendingTime;
    }

}

module.exports = TicketPendingTimeInput;
