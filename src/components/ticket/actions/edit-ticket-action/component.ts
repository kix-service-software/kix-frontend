import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class EditTicketActionComponent {

    private doAction(): void {
        // ApplicationService.getInstance().toggleMainDialog('edit-ticket-dialog');
        alert("Bearbeiten ...");
    }

}

module.exports = EditTicketActionComponent;
