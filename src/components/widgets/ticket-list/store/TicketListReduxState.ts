import { WidgetReduxState } from '@kix/core/dist/model/client';

export class TicketListReduxState extends WidgetReduxState {

    public users: any[] = [];

    public configuration: TicketListConfiguration;

    public socketListener: TicketListSocketListener;

}
