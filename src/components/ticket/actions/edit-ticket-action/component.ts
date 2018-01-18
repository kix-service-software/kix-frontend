import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class EditTicketActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('edit-ticket-dialog');
    }

}

module.exports = EditTicketActionComponent;
