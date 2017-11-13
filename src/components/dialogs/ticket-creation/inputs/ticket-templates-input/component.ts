import { TicketStore, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/";
import { TEMPLATE_CHANGED } from '@kix/core/dist/model/client/';

class TicketTemplateInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            isLoading: false
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        const reduxState = TicketStore.getInstance().getTicketDataState();
        this.state.isLoading = reduxState.loadTicketData;
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(TEMPLATE_CHANGED(event.target.value));
    }

}

module.exports = TicketTemplateInput;
