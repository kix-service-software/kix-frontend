import {
    ICreateObjectDialogExtension,
    CreateDialog
} from '@kix/core';

export class CreateTicketDialogExtension implements ICreateObjectDialogExtension {
    public getDialog(): CreateDialog {
        return new CreateDialog(
            "create-ticket-dialog",
            "Ticket erstellen",
            "Erstellen eines neuen Tickets",
            "",
            this.getTemplatePath()
        );
    }

    private getTemplatePath(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/dialogs/create-ticket/';
    }
}

module.exports = (data, host, options) => {
    return new CreateTicketDialogExtension();
};
