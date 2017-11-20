import { SUBJECT_CHANGED } from "@kix/core/dist/browser/ticket";
import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';
import { ComponentId } from "../../model/ComponentId";

class TicketSubjectInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {
            subject: ''
        };
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
        this.setStoreData();
    }

    public stateChanged(): void {
        this.setStoreData();
    }

    public valueChanged(event: any): void {
        TicketStore.getStore().dispatch(SUBJECT_CHANGED(ComponentId.TICKET_CREATION_ID, event.target.value));
    }

    private setStoreData(): void {
        const creationData = TicketStore.getTicketCreationData(ComponentId.TICKET_CREATION_ID);
        if (creationData) {
            this.state.subject = creationData.subject;
        }
    }

}

module.exports = TicketSubjectInput;
