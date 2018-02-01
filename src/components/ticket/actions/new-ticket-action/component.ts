import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class NewTicketActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleMainDialog('dialog-creation-container');
    }

}

module.exports = NewTicketActionComponent;
