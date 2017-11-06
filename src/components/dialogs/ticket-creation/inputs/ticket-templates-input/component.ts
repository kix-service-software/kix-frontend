import { CreationTicketStore } from './../../store/index';
import { TicketCreationProcessReduxState } from './../../store/TicketCreationProcessReduxState';
import { TicketCreationReduxState } from './../../store/TicketCreationReduxState';
import { TEMPLATE_CHANGED } from '../../store/actions';

class TicketTemplateInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            isLoading: false
        };
    }

    public onMount(): void {
        CreationTicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        const reduxState: TicketCreationProcessReduxState =
            CreationTicketStore.getInstance().getStore().getState().ticketProcessState;

        this.state.isLoading = reduxState.loadTicketData;
    }

    public valueChanged(event: any): void {
        CreationTicketStore.getInstance().getStore().dispatch(TEMPLATE_CHANGED(event.target.value));
    }

}

module.exports = TicketTemplateInput;
