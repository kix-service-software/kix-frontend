import { StandardTable } from '@kix/core/dist/browser';
import { Ticket, WidgetComponentState, IAction, KIXObjectPropertyFilter } from '@kix/core/dist/model';

import { TicketListSettings } from './TicketListSettings';

export class TicketListComponentState extends WidgetComponentState<TicketListSettings> {
    public standardTable: StandardTable<Ticket> = null;
    public predefinedTableFilter: KIXObjectPropertyFilter[] = [];
    public generalTicketActions: IAction[] = [];
    public title: string = '';

}
