import {
    SocketEvent,
    CreateTicket,
    TicketCreationRequest,
    TicketCreationResponse,
    TicketCreationEvent
} from '@kix/core';
import { KIXCommunicator } from './KIXCommunicator';

export class TicketCreationCommunicator extends KIXCommunicator {
    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/ticket-creation');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    private registerEvents(client: SocketIO.Socket): void {
        client.on(TicketCreationEvent.CREATE_TICKET, async (data: TicketCreationRequest) => {

            const ticket = new CreateTicket(
                data.subject,
                data.customerUser,
                data.customerId,
                data.stateId,
                data.priorityId,
                data.queueId,
                null,
                data.typeId,
                data.serviceId,
                data.slaId,
                data.ownerId,
                data.responsibleId,
                data.pendingTime,
                data.dynamicFields,
                []
            );
            const ticketId = await this.ticketService.createTicket(data.token, ticket);

            client.emit(TicketCreationEvent.TICKET_CREATED, new TicketCreationResponse(ticketId));
        });
    }
}
