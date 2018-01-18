import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class LinkTicketActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('link-ticket-dialog');
    }

}

module.exports = LinkTicketActionComponent;
