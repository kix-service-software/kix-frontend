import { AbstractAction, KIXObjectType, ContextMode } from '../../../../../model';
import { ContextService } from '../../../../context';

export class TicketTypeCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New Type';
        this.icon = 'kix-icon-new-gear';
    }

    public async run(event: any): Promise<void> {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_TYPE, ContextMode.CREATE_ADMIN, null, true, 'Translatable#Ticket'
        );
    }

}
