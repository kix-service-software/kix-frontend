import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class LockTicketActionComponent {

    private doAction(): void {
        ApplicationService.getInstance().toggleMainDialog('lock-ticket-dialog');
    }

}

module.exports = LockTicketActionComponent;
