import { AbstractAction } from '../../../model/components/action/AbstractAction';
import { ContextMode, KIXObjectType, CRUD } from '../../../model';
import { ContextService } from '../../context';
import { UIComponentPermission } from '../../../model/UIComponentPermission';

export class ContactCreateTicketAction extends AbstractAction {

    public permissions = [
        new UIComponentPermission('tickets', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Ticket';
        this.icon = 'kix-icon-new-ticket';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            null, KIXObjectType.TICKET, ContextMode.CREATE, null, true,
            undefined, undefined, 'new-ticket-form'
        );
    }

}
