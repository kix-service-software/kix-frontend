import { TicketService, TicketNotification } from "@kix/core/dist/browser/ticket/";
import { ContextService, ContextNotification } from "@kix/core/dist/browser/context";
import { Contact } from "@kix/core/dist/model";
import { ContactInfoWidgetComponentState } from './ContactInfoWidgetComponentState';

class ContactInfoWidgetComponent {

    private state: ContactInfoWidgetComponentState;

    public onCreate(input: any): void {
        this.state = new ContactInfoWidgetComponentState(input.instanceId);
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

module.exports = ContactInfoWidgetComponent;
