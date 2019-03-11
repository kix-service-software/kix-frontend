import { AbstractAction, KIXObjectType, ContextMode } from '../../../../../model';
import { ContextService } from '../../../../context';

export class TicketStateCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = 'Translatable#New State';
        this.icon = 'kix-icon-new-gear';
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_STATE, ContextMode.CREATE_ADMIN, null, true, 'Stammdaten hinzufügen'
        );
    }

}
