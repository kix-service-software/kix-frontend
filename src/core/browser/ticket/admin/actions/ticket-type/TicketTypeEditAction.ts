import { AbstractAction, ContextMode, KIXObjectType, FormInstance, CRUD } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";

export class TicketTypeEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('tickettypes/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-ticket-type-form', false);
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.TICKET_TYPE, ContextMode.EDIT_ADMIN, null, true
        );
    }

}
