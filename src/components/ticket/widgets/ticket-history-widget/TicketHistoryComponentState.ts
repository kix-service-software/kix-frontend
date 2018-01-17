import { TicketHistory, WidgetConfiguration } from '@kix/core/dist/model';

export class TicketHistoryComponentState {

    public instanceId: string = null;

    public ticketId: number = null;

    public widgetConfiguration: WidgetConfiguration = null;

    public history: TicketHistory[] = [];

}
