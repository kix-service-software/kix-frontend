import { ContextService } from "@kix/core/dist/browser/context/ContextService";
import { Ticket } from "@kix/core/dist/model/ticket/Ticket";
import { TicketService } from "@kix/core/dist/browser/ticket/TicketService";

class EditTicketDialogComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            ticket: null
        };
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        if (context && context.contextObjectId) {
            this.state.ticket = TicketService.getInstance().getTicket(context.contextObjectId);
        }
    }

}

module.exports = EditTicketDialogComponent;
