import { TicketHistory, WidgetConfiguration } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model/';

export class TicketHistoryComponentState extends WidgetComponentState {

    public ticketId: number = null;

    public history: TicketHistory[] = [];

    public filteredHistory: TicketHistory[] = [];

    public filterValue: string = '';

}
