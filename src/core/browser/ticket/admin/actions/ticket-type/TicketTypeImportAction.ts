import { AbstractAction } from '../../../../../model';

export class TicketTypeImportAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Import';
        this.icon = 'kix-icon-import';
    }

}
