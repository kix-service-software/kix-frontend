import { TicketStore } from '@kix/core/dist/browser/ticket/TicketStore';

class TicketAttachmentInput {

    public state: any;

    public onCreate(input: any): void {
        this.state = {};
    }

    public onMount(): void {
        TicketStore.getInstance().addStateListener(this.stateChanged.bind(this));
    }

    public stateChanged(): void {
        //
    }

}

module.exports = TicketAttachmentInput;
