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
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.typeId = Number(reduxState.typeId);
    }

    public stateChanged(state: TicketCreationReduxState): void {
        const processState: TicketCreationProcessReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketProcessState;

        this.state.ticketTypes = processState.types;

        this.state.loading = processState.loadTicketData;

        const reduxState: TicketCreationReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketState;
        this.state.typeId = Number(reduxState.typeId);
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(TYPE_ID_CHANGED(event.target.value));
    }

}

module.exports = TicketTypeInput;
