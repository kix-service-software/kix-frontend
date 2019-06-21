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
