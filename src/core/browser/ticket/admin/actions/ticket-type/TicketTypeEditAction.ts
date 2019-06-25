import { AbstractAction, ContextMode, KIXObjectType, CRUD } from "../../../../../model";
import { ContextService } from "../../../../context";
import { TicketTypeDetailsContext, EditTicketTypeDialogContext } from "../../context";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";

export class TicketTypeEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/types/*', [CRUD.UPDATE])
    ];

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
