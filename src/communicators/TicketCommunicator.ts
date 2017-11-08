import {
    SearchTicketsRequest,
    SearchTicketsResponse,
    SocketEvent,
    Ticket,
    TicketEvent
} from '@kix/core/dist/model/client';

import { KIXCommunicator } from './KIXCommunicator';

export class TicketCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/tickets');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    private registerEvents(client: SocketIO.Socket): void {
        client.on(TicketEvent.LOAD_TICKETS, async (data: SearchTicketsRequest) => {
            const tickets = await this.ticketService.getTickets(data.token, data.properties, data.limit);
            client.emit(TicketEvent.TICKETS_LOADED, new SearchTicketsResponse((tickets as Ticket[])));
        });
    }

}
