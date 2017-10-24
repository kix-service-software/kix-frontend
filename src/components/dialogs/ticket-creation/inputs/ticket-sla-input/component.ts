import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { SLA_ID_CHANGED } from '../../store/actions';

class TicketServiceInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            slaId: null
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.slaId = reduxState.slaId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.slaId = reduxState.slaId;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(SLA_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketServiceInput;
