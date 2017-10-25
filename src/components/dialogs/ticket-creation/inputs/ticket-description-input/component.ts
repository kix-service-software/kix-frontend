import { CreationTicketStore } from './../../store/index';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { DESCRIPTION_CHANGED } from '../../store/actions';

class TicketDescriptionInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            description: null
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.description = reduxState.description;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.description = reduxState.description;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(DESCRIPTION_CHANGED(event.target.value));
    }

}

module.exports = TicketDescriptionInput;
