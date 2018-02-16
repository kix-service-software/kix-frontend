import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { Ticket } from '@kix/core/dist/model';
import { ContextFilter } from '@kix/core/dist/model/';
import { TicketListSettings } from './TicketListSettings';
import { StandardTableConfiguration } from '@kix/core/dist/browser';

export class TicketListComponentState extends WidgetComponentState<TicketListSettings> {

    public tableConfiguration: StandardTableConfiguration<Ticket> = null;

    public filterValue: string = null;

    public contextFilter: ContextFilter = null;

}
