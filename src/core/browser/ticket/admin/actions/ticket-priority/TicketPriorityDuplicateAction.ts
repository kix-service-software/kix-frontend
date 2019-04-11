import { AbstractAction } from '../../../../../model';

export class TicketPriorityDuplicateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

}
