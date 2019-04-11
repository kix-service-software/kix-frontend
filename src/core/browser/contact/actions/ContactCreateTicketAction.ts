import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType } from '../../../model';
import { ContextService } from '../../context';

export class ContactCreateTicketAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Ticket';
        this.icon = 'kix-icon-new-ticket';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.CREATE, null, true);
    }

}
