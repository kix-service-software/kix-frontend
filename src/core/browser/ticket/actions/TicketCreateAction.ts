import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class TicketCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New Ticket';
        this.icon = 'kix-icon-new-ticket';
    }

    public async run(): Promise<void> {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.CREATE, null, true);
    }

}
