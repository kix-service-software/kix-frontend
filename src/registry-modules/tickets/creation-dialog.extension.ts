import { ICreationDialogExtension } from '@kix/core/dist/extensions';
import { CreationDialog } from '@kix/core/dist/model';

export class TicketCreationDialogExtension implements ICreationDialogExtension {
    public getDialog(): CreationDialog {
        return new CreationDialog(
            "ticket-creation-dialog",
            "Ticket erstellen",
            "Erstellen eines neuen Tickets",
            "",
            this.getTemplatePath()
        );
    }

    private getTemplatePath(): string {
        const packageJson = require('../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/ticket/ticket-creation-dialog/';
    }
}

module.exports = (data, host, options) => {
    return new TicketCreationDialogExtension();
};
