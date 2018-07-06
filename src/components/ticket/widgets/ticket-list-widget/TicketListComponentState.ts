import { StandardTable, TableConfiguration } from '@kix/core/dist/browser';
import { Ticket, WidgetComponentState, IAction, KIXObjectPropertyFilter } from '@kix/core/dist/model';

export class TicketListComponentState extends WidgetComponentState<TableConfiguration> {
    public standardTable: StandardTable = null;
    public predefinedTableFilter: KIXObjectPropertyFilter[] = [];
    public generalTicketActions: IAction[] = [];
    public title: string = '';

}
