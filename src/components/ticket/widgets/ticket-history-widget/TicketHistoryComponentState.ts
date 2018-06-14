import { StandardTable } from '@kix/core/dist/browser';
import { AbstractAction, TicketHistory, Ticket } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/model/';

import { TicketHistorySettings } from './TicketHistorySettings';

export class TicketHistoryComponentState extends WidgetComponentState<TicketHistorySettings> {

    public constructor(
        public ticketId: number = null,
        public standardTable: StandardTable<TicketHistory> = null,
        public filterValue: string = '',
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null
    ) {
        super();
    }

}
