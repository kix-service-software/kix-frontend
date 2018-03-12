import {
    CreateArticle,
    CreateTicket,
} from '@kix/core/dist/api';

import {
    Contact, Customer,
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, LoadTicketRequest, LoadTicketResponse,
    QuickSearchRequest,
    SetArticleSeenFlagRequest,
    SocketEvent, SearchTicketsRequest, SearchTicketsResponse,
    Ticket, TicketCreationEvent, TicketCreationRequest, TicketEvent, TicketCreationResponse, TicketCreationError,
    TicketProperty
} from '@kix/core/dist/model/';

import { KIXCommunicator } from './KIXCommunicator';
import { TicketService } from '../services/api/';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';
import { currentId } from 'async_hooks';

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

        client.on(TicketEvent.LOAD_TICKET, async (data: LoadTicketRequest) => {
            const loadedTicket = await this.ticketService.getTicket(data.token, data.ticketId, true, true);
            let contact;
            let customer;
            if (loadedTicket.CustomerUserID) {
                contact = await this.contactService.getContact(data.token, loadedTicket.CustomerUserID)
                    .catch((error) => {
                        return undefined;
                    });

                customer = await this.customerService.getCustomer(
                    data.token, loadedTicket.CustomerID.toString()
                ).catch((error) => {
                    return undefined;
                });
            }

            const ticket = new Ticket(loadedTicket, contact, customer);

            const response = new LoadTicketResponse(ticket);
            client.emit(TicketEvent.TICKET_LOADED, response);
        });

        client.on(TicketEvent.LOAD_ARTICLE_ATTACHMENT, async (data: LoadArticleAttachmentRequest) => {
            const attachemnt = await this.ticketService.getArticleAttachment(
                data.token, data.ticketId, data.articleId, data.attachmentId
            );

            const response = new LoadArticleAttachmentResponse(attachemnt);
            client.emit(TicketEvent.ARTICLE_ATTACHMENT_LOADED, response);
        });

        client.on(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, async (data: SetArticleSeenFlagRequest) => {
            await this.ticketService.setArticleSeenFlag(data.token, data.ticketId, data.articleId);
            client.emit(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE);
        });
    }
}
