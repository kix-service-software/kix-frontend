import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class SpamTicketActionComponent {

    private doAction(): void {
        ApplicationService.getInstance().toggleMainDialog('spam-ticket-dialog');
    }

}

module.exports = SpamTicketActionComponent;
