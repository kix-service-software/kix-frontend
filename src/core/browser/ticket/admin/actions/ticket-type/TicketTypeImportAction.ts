import { AbstractAction } from '../../../../../model';

export class TicketTypeImportAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Import';
        this.icon = 'kix-icon-import';
    }

}
