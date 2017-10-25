import {
    SocketEvent,
    SearchUserRequest,
    SearchUserResponse,
    CreateTicket,
    TicketCreationRequest,
    TicketCreationResponse,
    TicketCreationEvent,
    TicketCreationLoadDataRequest,
    TicketCreationLoadDataResponse,
    TicketState,
    User
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
                data.subject, data.customerUser, data.customerId, data.stateId, data.priorityId,
                data.queueId, null, data.typeId, data.serviceId, data.slaId, data.ownerId,
                data.responsibleId, data.pendingTime, data.dynamicFields, null
            );
            const ticketId = await this.ticketService.createTicket(data.token, ticket);

            client.emit(TicketCreationEvent.TICKET_CREATED, new TicketCreationResponse(ticketId));
        });

        client.on(TicketCreationEvent.LOAD_TICKET_DATA, async (data: TicketCreationLoadDataRequest) => {
            const ticketStates = await this.ticketStateService.getTicketStates(data.token);
            const ticketTypes = await this.ticketTypeService.getTicketTypes(data.token);
            const ticketPriorities = await this.ticketPriorityService.getTicketPriorities(data.token);

            const users = await this.userService.getUsers(data.token);
            const result: User[] = users.map((u) => {
                return {
                    UserID: u.UserID,
                    UserLogin: u.UserLogin
                };
            });

            const response = new TicketCreationLoadDataResponse(
                [], ticketStates, ticketTypes, ticketPriorities, [], [], [], users
            );

            client.emit(TicketCreationEvent.TICKET_DATA_LOADED, response);
        });

        client.on(TicketCreationEvent.SEARCH_USER, async (data: SearchUserRequest) => {
            // TODO: Filter via data.searchString
            const user = await this.userService.getUsers(data.token);
            const result: User[] = user.map((u) => {
                return {
                    UserID: u.UserID,
                    UserLogin: u.UserLogin
                };
            });
            client.emit(TicketCreationEvent.SEARCH_USER_FINISHED, new SearchUserResponse(result));
        });
    }
}
