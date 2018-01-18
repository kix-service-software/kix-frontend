import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class SpamTicketActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('spam-ticket-dialog');
    }

}

module.exports = SpamTicketActionComponent;
