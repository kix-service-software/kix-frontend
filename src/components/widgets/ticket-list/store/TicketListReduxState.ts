import { Ticket, WidgetReduxState } from '@kix/core/dist/model/client';

import { TicketListSocketListener } from '../socket/TicketListSocketListener';

export class TicketListReduxState extends WidgetReduxState {

    public users: any[] = [];

    public configuration: any;

    public tickets: Ticket[];

    public socketListener: TicketListSocketListener;

}
