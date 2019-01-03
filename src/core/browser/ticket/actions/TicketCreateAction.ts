import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode } from '../../../model';

export class TicketCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neues Ticket";
        this.icon = "kix-icon-new-ticket";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.CREATE);
    }

}
