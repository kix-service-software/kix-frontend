import { AbstractAction, KIXObjectType, ContextMode } from "../../../../../model";
import { ContextService } from "../../../../context";

export class TicketPriorityCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neue Priorität";
        this.icon = "kix-icon-gear";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_PRIORITY, ContextMode.CREATE_ADMIN, null, null, 'Stammdaten hinzufügen'
        );
    }

}
