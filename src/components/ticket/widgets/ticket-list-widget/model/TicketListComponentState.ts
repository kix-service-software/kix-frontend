import { StandardTable } from '@kix/core/dist/browser';
import { Ticket, WidgetComponentState } from '@kix/core/dist/model';
import { ContextFilter } from '@kix/core/dist/model/';

import { TicketListSettings } from './TicketListSettings';

export class TicketListComponentState extends WidgetComponentState<TicketListSettings> {

    public standardTable: StandardTable<Ticket> = null;

    public contextFilter: ContextFilter = null;

}
