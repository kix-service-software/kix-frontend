import { AbstractAction } from '../../../../../model';

export class TicketTypeDuplicateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Duplicate';
        this.icon = 'kix-icon-copy';
    }

}
