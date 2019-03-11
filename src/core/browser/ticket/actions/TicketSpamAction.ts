import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class TicketSpamAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#Spam';
        this.icon = 'kix-icon-warnsign';
    }

}
