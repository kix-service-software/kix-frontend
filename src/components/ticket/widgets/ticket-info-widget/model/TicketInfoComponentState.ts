import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Contact, Customer, Ticket } from '@kix/core/dist/model';

export class TicketInfoComponentState extends WidgetComponentState<any> {

    public ticket: Ticket = null;

    public ticketId: number = null;

    public isPending: boolean = false;

    public isAccountTimeEnabled: boolean = false;

}
