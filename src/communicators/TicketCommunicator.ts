import {
    CreateArticle,
    CreateTicket,
} from '@kix/core/dist/api';

import {
    Contact, Customer,
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, LoadTicketRequest, LoadTicketResponse,
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
        this.registerEventHandler(TicketEvent.LOAD_TICKETS, this.loadTickets.bind(this));
        this.registerEventHandler(TicketEvent.LOAD_TICKET, this.loadTicket.bind(this));
        this.registerEventHandler(TicketEvent.LOAD_ARTICLE_ATTACHMENT, this.loadArticleAttachment.bind(this));
        this.registerEventHandler(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, this.removeArticleSeenFlag.bind(this));
    }

    private async loadTickets(data: SearchTicketsRequest): Promise<CommunicatorResponse> {
        if (!data.properties.find((p) => p === TicketProperty.TICKET_ID)) {
            data.properties.push(TicketProperty.TICKET_ID);
        }

        const tickets = await this.ticketService.getTickets(data.token, data.properties, data.limit, data.filter)
            .catch((error) => {
                return new CommunicatorResponse(TicketEvent.LOAD_TICKET_ERROR, error.errorMessage.body);
            });
        return new CommunicatorResponse(
            TicketEvent.LOAD_TICKETS_FINISHED,
            new SearchTicketsResponse(data.requestId, tickets as Ticket[])
        );
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
