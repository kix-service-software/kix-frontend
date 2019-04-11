import { AbstractAction } from '../../../../../model';

export class TicketStateDuplicateAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

}
