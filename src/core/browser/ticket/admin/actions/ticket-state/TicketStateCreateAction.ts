import { AbstractAction, KIXObjectType, ContextMode } from "../../../../../model";
import { ContextService } from "../../../../context";

export class TicketStateCreateAction extends AbstractAction {

    public initAction(): void {
        this.text = "Neuer Status";
        this.icon = "kix-icon-gear";
    }

    public run(): void {
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_STATE, ContextMode.CREATE_ADMIN, null, null, 'Stammdaten hinzufügen'
        );
    }

}
