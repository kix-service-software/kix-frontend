import { TicketStore } from '@kix/core/dist/model/client/ticket/store/TicketStore';

class TicketAttachmentInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        TicketStore.addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        //
    }

}

module.exports = TicketAttachmentInput;
