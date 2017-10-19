import {
    DynamicField,
    SocketEvent,
    ClientStorageHandler,
    TicketCreationRequest,
    TicketCreationResponse,
    TicketCreationEvent
} from '@kix/core/dist/model/client';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';

export class TicketCreationSocketListener extends SocketListener {
    private ticketCreationSocket: SocketIO.Server;

    public constructor() {
        super();
        this.ticketCreationSocket = this.createSocket("ticket-creation");
        this.initConfigurationSocketListener(this.ticketCreationSocket);
    }

    public createTicket(
        subject: string, customerUser: string, customerId: string, stateId: number, priorityId: number,
        queueId: number, typeId: number, serviceId: number, slaId: number, ownerId: number, responsibleId: number,
        pendingTime: number, description: string, dynamicFields: DynamicField[]
    ): void {

        const token = ClientStorageHandler.getToken();
        const request = new TicketCreationRequest(
            token, subject, customerUser, customerId, stateId, priorityId, queueId, typeId,
            serviceId, slaId, ownerId, responsibleId, pendingTime, description, dynamicFields
        );

        this.ticketCreationSocket.emit(TicketCreationEvent.CREATE_TICKET, request);
    }

    private initConfigurationSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            //
        });

        socket.on(SocketEvent.CONNECT_ERROR, (error) => {
            console.error(error);
        });

        socket.on(SocketEvent.CONNECT_TIMEOUT, () => {
            console.error("Timeout");
        });

        socket.on(TicketCreationEvent.TICKET_CREATED,
            (result: TicketCreationResponse) => {
                //
            });

        socket.on('error', (error) => {
            console.error(error);
        });
    }
}
