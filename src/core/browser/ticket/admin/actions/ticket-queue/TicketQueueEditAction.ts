import { AbstractAction, KIXObjectType, ContextMode } from "../../../../../model";
import { ContextService } from "../../../../context";
import { QueueDetailsContext, EditQueueDialogContext } from "../../context";

export class TicketQueueEditAction extends AbstractAction {

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
