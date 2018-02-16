import { TicketHistory, WidgetConfiguration } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model/';
import { StandardTableConfiguration } from '@kix/core/dist/browser';

export class TicketHistoryComponentState extends WidgetComponentState {

    public ticketId: number = null;

    public historyTableConfiguration: StandardTableConfiguration<TicketHistory> = null;

    public filterValue: string = '';

}
