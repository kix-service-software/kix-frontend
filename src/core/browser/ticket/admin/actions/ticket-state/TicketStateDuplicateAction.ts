import { AbstractAction } from '../../../../../model';

export class TicketStateDuplicateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

}
