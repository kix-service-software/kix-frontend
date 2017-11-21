import { DESCRIPTION_CHANGED } from "@kix/core/dist/browser/ticket";
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from '../../model/ComponentId';

class TicketDescriptionInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            description: null
        };
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(newValue: string): void {
        TicketStore.getInstance().getStore().dispatch(DESCRIPTION_CHANGED(ComponentId.TICKET_CREATION_ID, newValue));
    }

    private setStoreData(): void {
        const creationData = TicketStore.getInstance().getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.description = creationData.description;
        }
    }
}

module.exports = TicketDescriptionInput;
