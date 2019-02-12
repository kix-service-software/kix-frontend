import { StandardTable, TableConfiguration } from '../../../../core/browser';
import { AbstractAction, TicketHistory, Ticket } from '../../../../core/model';
import { WidgetComponentState } from '../../../../core/model/';

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public standardTable: StandardTable<TicketHistory> = null,
        public filterValue: string = '',
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null,
        public loading: boolean = true,
        public filterCount: number = null
    ) {
        super();
    }

}
