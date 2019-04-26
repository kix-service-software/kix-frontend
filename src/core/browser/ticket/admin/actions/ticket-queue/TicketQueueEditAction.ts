import { AbstractAction, KIXObjectType, ContextMode, FormInstance } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";

export class TicketQueueEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    // public async run(): Promise<void> {
    //     await FormService.getInstance().getFormInstance<FormInstance>('edit-ticket-queue-form', false);
    //     ContextService.getInstance().setDialogContext(
    //         // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
    //         null, KIXObjectType.QUEUE, ContextMode.EDIT_ADMIN, null, true
    //     );
    // }

}
