import { AbstractAction, KIXObjectType, ContextMode, CRUD } from '../../../../../model';
import { ContextService } from '../../../../context';
import { UIComponentPermission } from '../../../../../model/UIComponentPermission';

export class TicketPriorityCreateAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/priorities', [CRUD.CREATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Translatable#New Priority';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_PRIORITY, ContextMode.CREATE_ADMIN, null, true, 'Translatable#Ticket'
        );
    }

}
