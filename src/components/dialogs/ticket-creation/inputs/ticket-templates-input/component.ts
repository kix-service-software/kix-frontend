import { TEMPLATE_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/model/client/ticket";
import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

class TicketTemplateInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            isLoading: false
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        const reduxState = TicketStore.getTicketDataState();
        this.state.isLoading = reduxState.loadTicketData;
    }

    public valueChanged(event: any): void {
        TicketStore.getStore().dispatch(TEMPLATE_CHANGED(event.target.value));
    }

}

module.exports = TicketTemplateInput;
