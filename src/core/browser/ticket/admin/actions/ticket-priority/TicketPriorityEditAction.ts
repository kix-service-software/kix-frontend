import { AbstractAction, KIXObjectType, ContextMode, FormInstance } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";

export class TicketPriorityEditAction extends AbstractAction {

    public initAction(): void {
        this.text = "Bearbeiten";
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-ticket-priority-form', false);
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_PRIORITY, ContextMode.EDIT_ADMIN, null, null, 'Stammdaten bearbeiten'
        );
    }

}
