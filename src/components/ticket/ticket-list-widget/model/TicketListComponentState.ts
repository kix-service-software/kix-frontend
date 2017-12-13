import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Ticket } from '@kix/core/dist/model';

export class TicketListComponentState extends WidgetComponentState {

    public tickets: Ticket[] = [];

    public filteredTickets: Ticket[] = [];

    public filterValue: string = null;

}
