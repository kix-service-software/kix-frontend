import { PENDING_TIME_CHANGED } from "@kix/core/dist/browser/ticket";
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from '../../model/ComponentId';

class TicketPendingTimeInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            pendingTime: null
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
            PENDING_TIME_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value)
        );
    }

    private setStoreData(): void {
        const creationData = TicketStore.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.pendingTime = creationData.pendingTime;
        }
    }

}

module.exports = TicketPendingTimeInput;
