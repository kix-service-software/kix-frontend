import { AbstractAction, ContextMode, KIXObjectType, FormInstance } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";
import { TicketStateDetailsContext, EditTicketStateDialogContext } from "../../context";

export class TicketStateEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketStateDetailsContext>(
            TicketStateDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditTicketStateDialogContext.CONTEXT_ID, KIXObjectType.TICKET_STATE,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
