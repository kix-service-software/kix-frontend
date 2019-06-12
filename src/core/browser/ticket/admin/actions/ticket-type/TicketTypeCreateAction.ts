import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../../../model';
import { ContextService } from '../../../../context';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';

export class TicketTypeCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/types', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Type';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_TYPE, ContextMode.CREATE_ADMIN, null, true, 'Translatable#Ticket',
            undefined, 'new-ticket-type-form'
        );
    }

}
