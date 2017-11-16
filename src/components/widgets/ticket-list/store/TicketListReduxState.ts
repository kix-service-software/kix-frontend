import { Ticket, WidgetReduxState } from '@kix/core/dist/model/client';

import { TicketListSocketListener } from '../socket/TicketListSocketListener';
import { TicketListSettings } from '../model/TicketListSettings';

export class TicketListReduxState extends WidgetReduxState {

    public settings: TicketListSettings;

    public tickets: Ticket[];

    public socketListener: TicketListSocketListener;

}
