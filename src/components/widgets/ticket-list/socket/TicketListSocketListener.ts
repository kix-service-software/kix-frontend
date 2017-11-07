import {
    ClientStorageHandler,
    LoadTicketsRequest,
    LoadTicketsResponse,
    SocketEvent,
    Ticket,
    TicketEvent,
    WidgetSocketListener,
} from '@kix/core/dist/model/client/';

import { TICKET_LIST_ERROR, WIDGET_LOADED } from '../store/actions';

export class TicketListSocketListener extends WidgetSocketListener {

    private ticketSocket: SocketIO.Server;

    public constructor(store: any, widgetId: string, instanceId: string) {
        super(store, widgetId, instanceId);

        this.ticketSocket = this.createSocket("tickets");
        this.initSocketListener();
    }

    public async loadTickets(limit: number, properties: string[]): Promise<Ticket[]> {
        return new Promise<Ticket[]>((resolve, reject) => {
            const token = ClientStorageHandler.getToken();
            this.ticketSocket.emit(TicketEvent.LOAD_TICKETS, new LoadTicketsRequest(token, limit, properties));

            // TODO: Timeout?
            this.ticketSocket.on(TicketEvent.TICKETS_LOADED, (result: LoadTicketsResponse) => {
                resolve(result.tickets);
            });
        });
    }

    protected handleWidgetSocketError(error: any): void {
        throw new Error("Method not implemented.");
    }

    protected widgetLoaded(configuration: any): void {
        this.store.dispatch(WIDGET_LOADED(configuration));
    }

    private initSocketListener(): void {
        this.ticketSocket.on(SocketEvent.CONNECT, () => {
            this.store.dispatch(TICKET_LIST_ERROR(null));
        });

        this.ticketSocket.on(SocketEvent.CONNECT_ERROR, (error) => {
            this.store.dispatch(TICKET_LIST_ERROR(String(error)));
        });

        this.ticketSocket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            this.store.dispatch(TICKET_LIST_ERROR('Timeout!'));
        });

        this.ticketSocket.on('error', (error) => {
            this.store.dispatch(TICKET_LIST_ERROR(String(error)));
        });
    }

}
