import { AbstractAction } from '../../../../../model';

export class TicketPriorityDuplicateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

}
