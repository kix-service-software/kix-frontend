import { TicketService, TicketNotification } from "@kix/core/dist/browser/ticket/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";

class CustomerInfoWidgetComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            instanceId: null,
            customer: null,
            widgetConfiguration: null
        };
    }

    public onInput(input: any) {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));

        this.loadCustomer(context.contextObjectId);
    }

    private ticketServiceNotified(id: number, type: TicketNotification, ...args): void {
        const context = ContextService.getInstance().getContext();
        if (type === TicketNotification.TICKET_LOADED && id === context.contextObjectId) {
            this.loadCustomer(context.contextObjectId);
        }
    }

    private loadCustomer(ticketId: number): void {
        const ticket = TicketService.getInstance().getTicket(ticketId);
        this.state.customer = ticket ? ticket.customer : undefined;
    }

}

module.exports = CustomerInfoWidgetComponent;
