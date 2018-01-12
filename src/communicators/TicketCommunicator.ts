import {
    CreateArticle,
    CreateTicket,
} from '@kix/core/dist/api';

import {
    Ticket,
    SocketEvent,
    SearchTicketsRequest,
    SearchTicketsResponse,
    TicketCreationEvent,
    TicketCreationRequest,
    TicketEvent,
    TicketCreationResponse,
    TicketCreationError,
    TicketLoadDataRequest,
    TicketLoadDataResponse,
    TicketProperty,
    LoadTicketDetailsRequest,
    LoadTicketDetailsResponse,
    TicketDetails,
    QuickSearchRequest
} from '@kix/core/dist/model/';

import { KIXCommunicator } from './KIXCommunicator';
import { TicketService } from '../services/api/TicketService';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';

export class TicketCommunicator extends KIXCommunicator {

    public registerNamespace(socketIO: SocketIO.Server): void {
        const nsp = socketIO.of('/tickets');
        nsp.on(SocketEvent.CONNECTION, (client: SocketIO.Socket) => {
            this.registerEvents(client);
        });
    }

    private registerEvents(client: SocketIO.Socket): void {
        client.on(TicketEvent.SEARCH_TICKETS, async (data: SearchTicketsRequest) => {
            if (!data.properties.find((p) => p === TicketProperty.TICKET_ID)) {
                data.properties.push(TicketProperty.TICKET_ID);
            }

            const tickets = await this.ticketService.getTickets(data.token, data.properties, data.limit, data.filter)
                .catch((error) => {
                    client.emit(TicketEvent.TICKET_SEARCH_ERROR, error.errorMessage.body);
                });
            client.emit(
                TicketEvent.TICKETS_SEARCH_FINISHED,
                new SearchTicketsResponse(data.requestId, tickets as Ticket[])
            );
        });

        client.on(TicketCreationEvent.CREATE_TICKET, async (data: TicketCreationRequest) => {

            const article = new CreateArticle(data.subject, data.description, null, 'text/html', 'utf8');

            const dynamicFields = (data.dynamicFields && data.dynamicFields.length !== 0) ? data.dynamicFields : null;

            const ticket = new CreateTicket(
                data.subject, data.customerUser, data.customerId, data.stateId, data.priorityId,
                data.queueId, null, data.typeId, data.serviceId, data.slaId, data.ownerId,
                data.responsibleId, data.pendingTime, dynamicFields, [article]
            );

            this.ticketService.createTicket(data.token, ticket)
                .then((ticketId: number) => {
                    client.emit(TicketCreationEvent.TICKET_CREATED, new TicketCreationResponse(ticketId));
                })
                .catch((error) => {
                    const creationError = new TicketCreationError(error.errorMessage.body);
                    client.emit(TicketCreationEvent.CREATE_TICKET_FAILED, creationError);
                });
        });

        client.on(TicketCreationEvent.LOAD_TICKET_DATA, async (data: TicketLoadDataRequest) => {
            const ticketStates = await this.ticketStateService.getTicketStates(data.token, null, null, null, {
                fields: 'TicketState.ID,TicketState.Name'
            });

            const ticketTypes = await this.ticketTypeService.getTicketTypes(data.token, null, null, null, {
                fields: 'TicketType.ID,TicketType.Name'
            });

            const ticketPriorities =
                await this.ticketPriorityService.getTicketPriorities(data.token, null, null, null, {
                    fields: 'Priority.ID,Priority.Name'
                });

            const users = await this.userService.getUsers(data.token, {
                fields: 'User.UserLogin,User.UserID,User.UserFullname'
            });

            const queues = await this.queueService.getQueues(data.token, null, null, null, {
                fields: 'Queue.QueueID,Queue.Name'
            });

            const response = new TicketLoadDataResponse(
                [], ticketStates, ticketTypes, ticketPriorities, queues, [], [], [], users
            );

            client.emit(TicketCreationEvent.TICKET_DATA_LOADED, response);
        });

        client.on(TicketEvent.LOAD_TICKET_DETAILS, async (data: LoadTicketDetailsRequest) => {

            const ticket = await this.ticketService.getTicket(data.token, data.ticketId, false);
            const articles = await this.ticketService.getArticles(data.token, data.ticketId);

            const ticketDetails = new TicketDetails(data.ticketId, (ticket as Ticket), articles);

            const response = new LoadTicketDetailsResponse(ticketDetails);
            client.emit(TicketEvent.TICKET_DETAILS_LOADED, response);
        });
    }

}
