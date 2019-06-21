import { AbstractAction, KIXObjectType, ContextMode, CRUD } from "../../../../../model";
import { ContextService } from "../../../../context";
import { UIComponentPermission } from "../../../../../model/UIComponentPermission";
import { TicketPriorityDetailsContext, EditTicketPriorityDialogContext } from "../../context";

export class TicketPriorityEditAction extends AbstractAction {

    public permissions: UIComponentPermission[] = [
        new UIComponentPermission('system/ticket/priorities/*', [CRUD.UPDATE])
    ];

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
