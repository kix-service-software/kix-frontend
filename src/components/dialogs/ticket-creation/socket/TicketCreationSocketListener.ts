import {
    DynamicField,
    SocketEvent,
    SearchUserRequest,
    SearchUserResponse,
    ClientStorageHandler,
    TicketCreationRequest,
    TicketCreationResponse,
    TicketCreationEvent,
    TicketCreationLoadDataRequest,
    TicketCreationLoadDataResponse,
    TicketState,
    User
} from '@kix/core/dist/model/client';
import { CreationTicketStore } from '../store/';
import { TICKET_DATA_LOADED } from '../store/actions';
import { SocketListener } from '@kix/core/dist/model/client/socket/SocketListener';

export class TicketCreationSocketListener extends SocketListener {
    private ticketCreationSocket: SocketIO.Server;

    public constructor() {
        super();
        this.ticketCreationSocket = this.createSocket("ticket-creation");
        this.initConfigurationSocketListener();
    }

    public async createTicket(
        subject: string, customerUser: string, customerId: string, stateId: number, priorityId: number,
        queueId: number, typeId: number, serviceId: number, slaId: number, ownerId: number, responsibleId: number,
        pendingTime: number, description: string, dynamicFields: DynamicField[]
    ): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const token = ClientStorageHandler.getToken();
            const request = new TicketCreationRequest(
                token, subject, customerUser, customerId, stateId, priorityId, queueId, typeId,
                serviceId, slaId, ownerId, responsibleId, pendingTime, description, dynamicFields
            );

            this.ticketCreationSocket.emit(TicketCreationEvent.CREATE_TICKET, request);

            // TODO: error handling and timeout
            this.ticketCreationSocket.on(TicketCreationEvent.TICKET_CREATED, (result: TicketCreationResponse) => {
                resolve(result.ticketId);
            });
        });

    }

    public loadTicketData(): void {
        const token = ClientStorageHandler.getToken();
        const request = new TicketCreationLoadDataRequest(token);
        this.ticketCreationSocket.emit(TicketCreationEvent.LOAD_TICKET_DATA, request);
    }

    private initConfigurationSocketListener(): void {
        this.ticketCreationSocket.on(SocketEvent.CONNECT, () => {
            //
        });

        this.ticketCreationSocket.on('error', (error) => {
            console.error(error);
        });

        this.ticketCreationSocket.on(TicketCreationEvent.TICKET_CREATED,
            (result: TicketCreationResponse) => {
                //
            });

        this.registerLoadDataEvents();
    }

    private registerLoadDataEvents(): void {
        this.ticketCreationSocket.on(TicketCreationEvent.TICKET_DATA_LOADED,
            (result: TicketCreationLoadDataResponse) => {
                CreationTicketStore.getInstance().getStore().dispatch(
                    TICKET_DATA_LOADED(
                        result.templates,
                        result.queues,
                        result.services,
                        result.slas,
                        result.ticketPriorities,
                        result.ticketStates,
                        result.ticketTypes,
                        result.users
                    )
                );
            });
    }
}
