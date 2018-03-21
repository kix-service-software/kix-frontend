import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class MergeTicketActionComponent {

    private doAction(): void {
        ApplicationService.getInstance().toggleMainDialog('merge-ticket-dialog');
    }

}

module.exports = MergeTicketActionComponent;
