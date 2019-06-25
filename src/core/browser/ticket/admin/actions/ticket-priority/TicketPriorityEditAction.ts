import { AbstractAction, KIXObjectType, ContextMode, FormInstance } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";
import { TicketPriorityDetailsContext, EditTicketPriorityDialogContext } from "../../context";

export class TicketPriorityEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketPriorityDetailsContext>(
            TicketPriorityDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditTicketPriorityDialogContext.CONTEXT_ID, KIXObjectType.TICKET_PRIORITY,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
