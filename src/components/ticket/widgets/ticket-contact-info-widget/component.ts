import { TicketService, TicketNotification } from "@kix/core/dist/browser/ticket/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";

class ContactInfoWidgetComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            instanceId: null,
            contact: null,
            widgetConfiguration: null,
            isLoading: true
        };
    }

    public onInput(input: any) {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));

        this.loadContact(context.contextObjectId);
    }

    private ticketServiceNotified(id: number, type: TicketNotification, ...args): void {
        const context = ContextService.getInstance().getContext();
        if (type === TicketNotification.TICKET_LOADED && id === context.contextObjectId) {
            this.loadContact(context.contextObjectId);
        }
    }

    private loadContact(ticketId: number): void {
        const ticket = TicketService.getInstance().getTicket(ticketId);
        if (ticket) {
            this.state.contact = ticket.contact;
            this.state.isLoading = false;
        }
    }

}

module.exports = ContactInfoWidgetComponent;
