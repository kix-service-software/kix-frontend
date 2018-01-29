import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Ticket } from '@kix/core/dist/model';
import { ContextFilter } from '@kix/core/dist/model/';
import { TicketListSettings } from './TicketListSettings';

export class TicketListComponentState extends WidgetComponentState<TicketListSettings> {

    public tickets: Ticket[] = [];

    public filteredTickets: Ticket[] = [];

    public filterValue: string = null;

    public contextFilter: ContextFilter = null;

}
