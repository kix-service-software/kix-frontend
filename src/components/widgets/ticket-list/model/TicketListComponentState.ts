import { Ticket, WidgetComponentState } from '@kix/core/dist/model/client';

export class TicketListComponentState extends WidgetComponentState {

    public tickets: Ticket[] = [];

    public properties: string[] = [];

}
