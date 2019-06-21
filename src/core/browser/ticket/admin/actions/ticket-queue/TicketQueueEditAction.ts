import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { AbstractAction, KIXObjectType, ContextMode, CRUD } from "../../../../../model";
import { ContextService } from "../../../../context";
import { QueueDetailsContext, EditQueueDialogContext } from "../../context";

export class TicketQueueEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/queues/*', [CRUD.UPDATE])
    ];

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<QueueDetailsContext>(
            QueueDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditQueueDialogContext.CONTEXT_ID, KIXObjectType.QUEUE,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
