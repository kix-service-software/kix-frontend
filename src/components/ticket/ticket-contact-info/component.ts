import { TicketService, TicketNotification } from "@kix/core/dist/browser/ticket/";
import { ContextService } from "@kix/core/dist/browser/context";
import { Contact } from "@kix/core/dist/model";

class ContactInfoComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            contact: null
        };
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        TicketService.getInstance().addServiceListener(this.ticketServiceNotified.bind(this));
        this.loadContact(context.objectId);
    }

    private ticketServiceNotified(id: number, type: TicketNotification, ...args): void {
        const context = ContextService.getInstance().getContext();
        if (type === TicketNotification.TICKET_LOADED && id === context.objectId) {
            this.loadContact(context.objectId);
        }
    }

    private loadContact(ticketId: number): void {
        const ticket = TicketService.getInstance().getTicket(ticketId);
        if (ticket && this.contactChanged(ticket.contact)) {
            this.state.contact = ticket.contact;
        }
    }

    private contactChanged(contact: Contact): boolean {
        let changed = true;

        if (this.state.contact) {
            changed = contact && !this.state.contact.equals(contact);
        }

        return changed;
    }

}

module.exports = ContactInfoComponent;
