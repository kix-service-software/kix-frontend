import {
    CreateArticle,
    CreateTicket,
} from '@kix/core/dist/api';

import {
    Contact,
    Customer,
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
    QuickSearchRequest,
    LoadArticleAttachmentResponse,
    LoadArticleAttachmentRequest
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
                fields: 'TicketState.ID,TicketState.Name,TicketState.TypeID'
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

            const queuesHierarchy = await this.queueService.getQueues(data.token, null, null, null, {
                fields: 'Queue.QueueID,Queue.Name',
                include: 'SubQueues',
                expand: 'SubQueues',
                filter: '{"Queue": {"AND": [{"Field": "ParentID", "Operator": "EQ", "Value": null}]}}'
            });

            const services = await this.serviceService.getServices(data.token, null, null, null, {
                fields: 'Service.ServiceID,Service.Name',
                include: 'IncidentState'
            });

            let ticketNotesDFId: number;
            const ticketNotesDFList = await this.dynamicFieldService.getDynamicFields(data.token, null, null, null, {
                fields: 'DynamicField.ID',
                filter: '{"DynamicField": {"AND": [{"Field": "Name", "Operator": "EQ", "Value": "TicketNotes"}]}}'
            });
            if (ticketNotesDFList && ticketNotesDFList.length) {
                ticketNotesDFId = ticketNotesDFList[0].ID;
            }

            const stateTypes = await this.ticketStateService.getTicketStateTypes(data.token);

            const ticketHookConfig = await this.sysConfigService.getSysConfigItem(data.token, 'Ticket::Hook');
            const ticketHookDividerConfig =
                await this.sysConfigService.getSysConfigItem(data.token, 'Ticket::HookDivider');

            const timeAccountConfig =
                await this.sysConfigService.getSysConfigItem(data.token, 'Ticket::Frontend::AccountTime');
            const isAccountTimeEnabled = (timeAccountConfig.Data && timeAccountConfig.Data === '1');

            const timeAccountUnitConfig =
                await this.sysConfigService.getSysConfigItem(data.token, 'Ticket::Frontend::TimeUnits');
            const timeAccountUnit = timeAccountUnitConfig.Data;

            const ticketLocks = await this.ticketLockService.getLocks(data.token);

            const response = new TicketLoadDataResponse(
                [], ticketStates, stateTypes, ticketTypes, ticketPriorities, queues, queuesHierarchy,
                services, [], users, ticketHookConfig.Data, ticketHookDividerConfig.Data,
                isAccountTimeEnabled, timeAccountUnit, ticketNotesDFId, ticketLocks
            );

            client.emit(TicketCreationEvent.TICKET_DATA_LOADED, response);
        });

        client.on(TicketEvent.LOAD_TICKET_DETAILS, async (data: LoadTicketDetailsRequest) => {

            const ticket = await this.ticketService.getTicket(data.token, data.ticketId);
            const articles = await this.ticketService.getArticles(data.token, data.ticketId);
            const contact = await this.contactService.getContact(data.token, ticket.CustomerUserID).catch((error) => {
                return undefined;
            });
            const customer = await this.customerService.getCustomer(
                data.token, ticket.CustomerID.toString()
            ).catch((error) => {
                return undefined;
            });

            const history = await this.ticketService.getTicketHistory(data.token, data.ticketId);

            const ticketDetails = new TicketDetails(
                Number(data.ticketId),
                (ticket as Ticket),
                articles,
                (contact as Contact),
                (customer as Customer),
                history
            );

            const response = new LoadTicketDetailsResponse(ticketDetails);
            client.emit(TicketEvent.TICKET_DETAILS_LOADED, response);
        });

        client.on(TicketEvent.LOAD_ARTICLE_ATTACHMENT, async (data: LoadArticleAttachmentRequest) => {
            const attachemnt = await this.ticketService.getArticleAttachment(
                data.token, data.ticketId, data.articleId, data.attachmentId
            );

            const response = new LoadArticleAttachmentResponse(attachemnt);
            client.emit(TicketEvent.ARTICLE_ATTACHMENT_LOADED, response);
        });
    }
}
