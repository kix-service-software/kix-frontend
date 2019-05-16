import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextService } from '../../context';
import { KIXObjectType, ContextMode, CRUD } from '../../../model';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class TicketCreateAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Ticket';
        this.icon = 'kix-icon-new-ticket';
    }

    public async run(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.TICKET, ContextMode.CREATE, null, true, undefined, undefined, 'new-ticket-form'
        );
    }

}
