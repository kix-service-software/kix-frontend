import { AbstractAction } from '../../../../../model';

export class TicketPriorityImportAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Import';
        this.icon = 'kix-icon-import';
    }

}
