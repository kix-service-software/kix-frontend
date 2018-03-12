import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Ticket } from '@kix/core/dist/model';
import { ContextFilter } from '@kix/core/dist/model/';
import { TicketListSettings } from './TicketListSettings';
import { StandardTable } from '@kix/core/dist/browser';

export class TicketListComponentState extends WidgetComponentState<TicketListSettings> {

    public standardTable: StandardTable<Ticket> = null;

    public contextFilter: ContextFilter = null;

}
