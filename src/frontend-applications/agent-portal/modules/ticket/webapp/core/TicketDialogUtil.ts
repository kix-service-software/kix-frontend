/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import { TicketDetailsContext, EditTicketDialogContext, NewTicketDialogContext } from "./context";
import { ContextService } from "../../../../modules/base-components/webapp/core/ContextService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { ContextMode } from "../../../../model/ContextMode";
import { Ticket } from "../../model/Ticket";


export class TicketDialogUtil {

    public static async createTicket(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();

        let ticketId: number;
        if (context && context.getDescriptor().contextId === TicketDetailsContext.CONTEXT_ID) {
            const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET);
            if (ticket) {
                ticketId = ticket.TicketID;
            }
        }

        ContextService.getInstance().setDialogContext(
            NewTicketDialogContext.CONTEXT_ID, KIXObjectType.TICKET, ContextMode.CREATE, ticketId
        );
    }

    public static async editTicket(ticketId?: string | number): Promise<void> {
        if (!ticketId) {
            const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
                TicketDetailsContext.CONTEXT_ID
            );

            if (context) {
                ticketId = context.getObjectId();
            }
        }

        if (ticketId) {
            ContextService.getInstance().setDialogContext(
                EditTicketDialogContext.CONTEXT_ID, KIXObjectType.TICKET, ContextMode.EDIT, ticketId
            );
        }
    }

}
