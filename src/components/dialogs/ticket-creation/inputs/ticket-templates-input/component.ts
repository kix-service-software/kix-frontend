import { TEMPLATE_CHANGED, TicketCreationReduxState, TicketDataReduxState } from "@kix/core/dist/browser/ticket";
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from "../../model/ComponentId";

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
        // const reduxState = TicketStore.getTicketData(TICKET_CREATION_DATA_ID);
    }

    public valueChanged(event: any): void {
        TicketStore.getStore().dispatch(TEMPLATE_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value));
    }

}

module.exports = TicketTemplateInput;
