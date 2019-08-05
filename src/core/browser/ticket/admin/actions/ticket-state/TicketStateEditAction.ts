/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
