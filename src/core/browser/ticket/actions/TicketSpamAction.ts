import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class TicketSpamAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Spam';
        this.icon = 'kix-icon-warnsign';
    }

}
