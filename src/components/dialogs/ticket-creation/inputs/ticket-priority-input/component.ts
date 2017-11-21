import { PRIORITY_ID_CHANGED } from '@kix/core/dist/browser/ticket/';
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from "../../model/ComponentId";


class TicketPriorityInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            priorityId: null,
            ticketPriorities: []
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getInstance().getStore().dispatch(
            PRIORITY_ID_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value)
        );
    }

    private setStoreData(): void {
        const creationData = TicketStore.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.priorityId = Number(creationData.priorityId);
        }

        const ticketData = TicketStore.getInstance().getTicketData(ComponentId.TICKET_CREATION_TICKET_DATA_ID);
        if (ticketData) {
            this.state.ticketPriorities = ticketData.priorities;
        }
    }

}

module.exports = TicketPriorityInput;
