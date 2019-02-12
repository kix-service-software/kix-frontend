import { AbstractAction } from '../../../../../model';

export class TicketPriorityImportAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Import';
        this.icon = 'kix-icon-unknown';
    }

}
