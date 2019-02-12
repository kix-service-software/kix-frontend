import { AbstractAction } from '../../../model/components/action/AbstractAction';

export class TicketSpamAction extends AbstractAction {

    public initAction(): void {
        this.text = "Spam";
        this.icon = "kix-icon-warnsign";
    }

}
