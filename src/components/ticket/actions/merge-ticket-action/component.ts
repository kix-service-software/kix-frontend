import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class MergeTicketActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('merge-ticket-dialog');
    }

}

module.exports = MergeTicketActionComponent;
