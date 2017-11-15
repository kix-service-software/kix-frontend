import { WidgetComponentState } from '@kix/core/dist/model/client';

import { Ticket } from '@kix/core/dist/model/client/ticket';

export class TicketListComponentState extends WidgetComponentState {

    public tickets: Ticket[] = [];

    public filteredTickets: Ticket[] = [];

    public filterValue: string = null;

}
