import { TicketService, TicketNotification } from "@kix/core/dist/browser/ticket/";
import { ContextService } from "@kix/core/dist/browser/context";
import { Customer } from "@kix/core/dist/model";

class CustomerInfoComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            customer: null
        };
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));
        this.loadCustomer(context.objectId);
    }

    private ticketServiceNotified(id: number, type: TicketNotification, ...args): void {
        const context = ContextService.getInstance().getContext();
        if (type === TicketNotification.TICKET_LOADED && id === context.objectId) {
            this.loadCustomer(context.objectId);
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

module.exports = CustomerInfoComponent;
