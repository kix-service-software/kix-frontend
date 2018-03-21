import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class NewTicketActionComponent {

    private doAction(): void {
        ApplicationService.getInstance().toggleMainDialog('dialog-creation-container');
    }

}

module.exports = NewTicketActionComponent;
