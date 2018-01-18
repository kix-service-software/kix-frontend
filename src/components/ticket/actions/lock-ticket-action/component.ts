import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class LockTicketActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('lock-ticket-dialog');
    }

}

module.exports = LockTicketActionComponent;
