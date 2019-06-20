import { AbstractAction, ContextMode, KIXObjectType, FormInstance } from "../../../../../model";
import { ContextService } from "../../../../context";
import { FormService } from "../../../../form";
import { TicketTypeDetailsContext, EditTicketTypeDialogContext } from "../../context";

export class TicketTypeEditAction extends AbstractAction {

    public async initAction(): Promise<void> {
        this.text = 'Edit';
        this.icon = "kix-icon-edit";
    }

    public async run(): Promise<void> {
        const context = await ContextService.getInstance().getContext<TicketTypeDetailsContext>(
            TicketTypeDetailsContext.CONTEXT_ID
        );

        if (context) {
            const id = context.getObjectId();
            if (id) {
                ContextService.getInstance().setDialogContext(
                    EditTicketTypeDialogContext.CONTEXT_ID, KIXObjectType.TICKET_TYPE,
                    ContextMode.EDIT_ADMIN, id
                );
            }
        }
    }

}
