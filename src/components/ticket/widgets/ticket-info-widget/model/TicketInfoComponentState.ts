import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Contact, Customer, Ticket } from '@kix/core/dist/model';

export class TicketInfoComponentState extends WidgetComponentState {

    public ticket: Ticket = null;

    public contact: Contact = null;
    public customer: Customer = null;

    public ticketId: number = null;

}
