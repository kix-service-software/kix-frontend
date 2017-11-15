import { WidgetReduxState } from '@kix/core/dist/model/client';
import { Ticket } from '@kix/core/dist/model/client/ticket';
import { TicketListSocketListener } from '../socket/TicketListSocketListener';

export class TicketListReduxState extends WidgetReduxState {

    public configuration: any;

    public tickets: Ticket[];

    public socketListener: TicketListSocketListener;

}
