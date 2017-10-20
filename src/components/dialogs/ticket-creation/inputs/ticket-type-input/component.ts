import { CreationTicketStore } from './../../store/index';
import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { TYPE_ID_CHANGED } from '../../store/actions';

class TicketTypeInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            typeId: null,
            ticketTypes: [],
            loading: true
        };
    }

    public onMount(): void {
        CreationTicketStore.INSTANCE.addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState = CreationTicketStore.INSTANCE.getStore().getState().ticketState;
        this.state.typeId = reduxState.typeId;
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const reduxState: TicketCreationReduxState = CreationTicketStore.INSTANCE.getStore().getState().ticketState;
        this.state.typeId = reduxState.typeId;

        const processState: TicketCreationProcessReduxState =
            CreationTicketStore.INSTANCE.getStore().getState().ticketProcessState;

        this.state.ticketTypes = processState.types;

        this.state.loading = processState.loadTicketData;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.INSTANCE.getStore().dispatch(TYPE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketTypeInput;
