import { TicketHistory, WidgetConfiguration } from '@kix/core/dist/model';

export class TicketHistoryComponentState {

    public instanceId: string = null;

    public ticketId: number = null;

    public widgetConfiguration: WidgetConfiguration<any> = null;

    public history: TicketHistory[] = [];

    public filteredHistory: TicketHistory[] = [];

    public filterValue: string = '';

}
