import { StandardTable, TableConfiguration } from '@kix/core/dist/browser';
import { AbstractAction, TicketHistory, Ticket } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/model/';

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public standardTable: StandardTable<TicketHistory> = null,
        public filterValue: string = '',
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null,
        public loading: boolean = true
    ) {
        super();
    }

}
