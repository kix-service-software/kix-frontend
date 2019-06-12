import { AbstractAction, KIXObjectType, ContextMode, FormInstance, CRUD } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";

export class TicketPriorityEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/priorities/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-ticket-priority-form', false);
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_PRIORITY, ContextMode.EDIT_ADMIN, null, true
        );
    }

}
