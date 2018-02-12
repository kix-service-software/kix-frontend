import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class EditTicketActionComponent {

    private doAction(): void {
        // ApplicationStore.getInstance().toggleMainDialog('edit-ticket-dialog');
        alert("Bearbeiten ...");
    }

}

module.exports = EditTicketActionComponent;
