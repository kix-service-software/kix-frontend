import { TicketService, TicketNotification } from "@kix/core/dist/browser/ticket/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import { Customer } from "@kix/core/dist/model";
import { CustomerWidgetComponentState } from './CustomerWidgetComponentState';

class CustomerInfoWidgetComponent {

    private state: CustomerWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new CustomerWidgetComponentState(input.instanceId);
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
        if (ticket && this.customerChanged(ticket.customer)) {
            this.state.customer = ticket.customer;
        }
    }

    private customerChanged(customer: Customer): boolean {
        let changed = true;

        if (this.state.customer) {
            changed = !this.state.customer.equals(customer);
        }

        return changed;
    }

}

module.exports = CustomerInfoWidgetComponent;
