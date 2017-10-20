import {
    DynamicField,
    SocketEvent,
    ClientStorageHandler,
    TicketCreationRequest,
    TicketCreationResponse,
    TicketCreationEvent,
    TicketCreationLoadDataRequest,
    TicketCreationLoadDataResponse,
    TicketState
} from '@kix/core/dist/model/client';
import { CreationTicketStore } from '../store/';
import { TICKET_DATA_LOADED } from '../store/actions';
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

    public loadTicketData(): void {
        const token = ClientStorageHandler.getToken();
        const request = new TicketCreationLoadDataRequest(token);
        this.ticketCreationSocket.emit(TicketCreationEvent.LOAD_TICKET_DATA, request);
    }

    private initConfigurationSocketListener(socket: SocketIO.Server): void {
        socket.on(SocketEvent.CONNECT, () => {
            //
        });

        socket.on('error', (error) => {
            console.error(error);
        });

        socket.on(TicketCreationEvent.TICKET_CREATED,
            (result: TicketCreationResponse) => {
                //
            });

        this.registerLoadDataEvents(socket);
    }

    private registerLoadDataEvents(socket: SocketIO.Server): void {
        socket.on(TicketCreationEvent.TICKET_DATA_LOADED,
            (result: TicketCreationLoadDataResponse) => {
                CreationTicketStore.INSTANCE.getStore().dispatch(
                    TICKET_DATA_LOADED(
                        result.templates,
                        result.queues,
                        result.services,
                        result.slas,
                        result.ticketPriorities,
                        result.ticketStates,
                        result.ticketTypes
                    )
                );
            });
    }
}
