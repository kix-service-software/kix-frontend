import {
    CreateArticle,
    CreateTicket,
} from '@kix/core/dist/api';

import {
    Contact, Customer,
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, LoadTicketRequest, LoadTicketResponse,
    QuickSearchRequest,
    SetArticleSeenFlagRequest,
    SearchTicketsRequest, SearchTicketsResponse,
    Ticket, TicketCreationEvent, TicketCreationRequest, TicketEvent, TicketCreationResponse, TicketCreationError,
    TicketProperty
} from '@kix/core/dist/model/';

import { KIXCommunicator } from './KIXCommunicator';
import { TicketService } from '../services/api/';
import { currentId } from 'async_hooks';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class TicketCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'tickets';
    }

    protected registerEvents(): void {
        this.registerEventHandler(TicketEvent.SEARCH_TICKETS, this.searchTickets.bind(this));
        this.registerEventHandler(TicketCreationEvent.CREATE_TICKET, this.createTicket.bind(this));
        this.registerEventHandler(TicketEvent.LOAD_TICKET, this.loadTicket.bind(this));
        this.registerEventHandler(TicketEvent.LOAD_ARTICLE_ATTACHMENT, this.loadArticleAttachment.bind(this));
        this.registerEventHandler(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, this.removeArticleSeenFlag.bind(this));
    }

    private async searchTickets(data: SearchTicketsRequest): Promise<CommunicatorResponse> {
        if (!data.properties.find((p) => p === TicketProperty.TICKET_ID)) {
            data.properties.push(TicketProperty.TICKET_ID);
        }

        const tickets = await this.ticketService.getTickets(data.token, data.properties, data.limit, data.filter)
            .catch((error) => {
                return new CommunicatorResponse(TicketEvent.TICKET_SEARCH_ERROR, error.errorMessage.body);
            });
        return new CommunicatorResponse(
            TicketEvent.TICKETS_SEARCH_FINISHED,
            new SearchTicketsResponse(data.requestId, tickets as Ticket[])
        );
    }

    private async createTicket(data: TicketCreationRequest): Promise<CommunicatorResponse> {

        let response: CommunicatorResponse;

        const article = new CreateArticle(data.subject, data.description, null, 'text/html', 'utf8');

        const dynamicFields = (data.dynamicFields && data.dynamicFields.length !== 0) ? data.dynamicFields : null;

        const ticket = new CreateTicket(
            data.subject, data.customerUser, data.customerId, data.stateId, data.priorityId,
            data.queueId, null, data.typeId, data.serviceId, data.slaId, data.ownerId,
            data.responsibleId, data.pendingTime, dynamicFields, [article]
        );

        this.ticketService.createTicket(data.token, ticket)
            .then((ticketId: number) => {
                response = new CommunicatorResponse(TicketCreationEvent.TICKET_CREATED,
                    new TicketCreationResponse(ticketId));
            })
            .catch((error) => {
                const creationError = new TicketCreationError(error.errorMessage.body);
                response = new CommunicatorResponse(TicketCreationEvent.CREATE_TICKET_FAILED, creationError);
            });

        return response;
    }

    private async loadTicket(data: LoadTicketRequest): Promise<CommunicatorResponse> {
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
        return new CommunicatorResponse(TicketEvent.TICKET_LOADED, response);
    }

    private async loadArticleAttachment(data: LoadArticleAttachmentRequest): Promise<CommunicatorResponse> {
        const attachemnt = await this.ticketService.getArticleAttachment(
            data.token, data.ticketId, data.articleId, data.attachmentId
        );

        const response = new LoadArticleAttachmentResponse(attachemnt);
        return new CommunicatorResponse(TicketEvent.ARTICLE_ATTACHMENT_LOADED, response);
    }

    private async removeArticleSeenFlag(data: SetArticleSeenFlagRequest): Promise<CommunicatorResponse> {
        await this.ticketService.setArticleSeenFlag(data.token, data.ticketId, data.articleId);
        return new CommunicatorResponse(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE);
    }
}
