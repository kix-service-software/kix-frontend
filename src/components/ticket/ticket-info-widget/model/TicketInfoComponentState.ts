import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Ticket } from '@kix/core/dist/model';

export class TicketInfoComponentState extends WidgetComponentState {

    public ticket: Ticket = null;

    public ticketId: number = null;

}
