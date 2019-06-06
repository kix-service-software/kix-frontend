import { AbstractAction, CRUD, FormInstance, KIXObjectType, ContextMode } from "../../../../../model";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { FormService } from "../../../../form";
import { ContextService } from "../../../../context";

export class TicketQueueEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('queues/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        await FormService.getInstance().getFormInstance<FormInstance>('edit-ticket-queue-form', false);
        ContextService.getInstance().setDialogContext(
            // TODO: Titel aus dem aktiven Admin-Modul ermitteln (Kategorie)
            null, KIXObjectType.QUEUE, ContextMode.EDIT_ADMIN, null, true
        );
    }

}
