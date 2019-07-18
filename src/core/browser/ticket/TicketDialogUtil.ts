/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextService } from "../context";
import { TicketDetailsContext, EditTicketDialogContext, NewTicketDialogContext } from "./context";
import { KIXObjectType, ContextMode } from "../../model";

export class TicketDialogUtil {

    public static async createTicket(): Promise<void> {
        ContextService.getInstance().setDialogContext(
            NewTicketDialogContext.CONTEXT_ID, KIXObjectType.TICKET, ContextMode.CREATE
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
