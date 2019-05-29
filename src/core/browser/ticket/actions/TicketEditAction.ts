import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode, FormInstance, Ticket } from '../../../model';
import { FormService } from '../../form';

export class TicketEditAction extends AbstractAction<Ticket> {

    public async initAction(): Promise<void> {
        this.text = 'Translatable#Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-ticket-form', false);
        ContextService.getInstance().setDialogContext(null, KIXObjectType.TICKET, ContextMode.EDIT, null, true);
    }

}
