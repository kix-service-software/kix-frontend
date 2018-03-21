import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class LinkTicketActionComponent {

    private doAction(): void {
        ApplicationService.getInstance().toggleMainDialog('link-ticket-dialog');
    }

}

module.exports = LinkTicketActionComponent;
