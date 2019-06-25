import { AbstractAction, ContextMode, KIXObjectType, CRUD } from "../../../../../model";
import { ContextService } from "../../../../context";
import { TicketStateDetailsContext, EditTicketStateDialogContext } from "../../context";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";

export class TicketStateEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/states/*', [CRUD.UPDATE])
    ];

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
