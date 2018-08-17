import {
    CreateArticle,
    CreateTicket,
} from '@kix/core/dist/api';

import {
    Contact, Customer,
    LoadArticleAttachmentResponse, LoadArticleAttachmentRequest, LoadTicketRequest, LoadTicketResponse,
    SetArticleSeenFlagRequest,
    SearchTicketsRequest, SearchTicketsResponse,
    Ticket, TicketEvent,
    TicketProperty,
    LoadArticleZipAttachmentRequest,
    TicketFactory
} from '@kix/core/dist/model/';

import { KIXCommunicator } from './KIXCommunicator';
import { CommunicatorResponse } from '@kix/core/dist/common';

export class TicketCommunicator extends KIXCommunicator {

    protected getNamespace(): string {
        return 'tickets';
    }

    protected registerEvents(client: SocketIO.Socket): void {
        this.registerEventHandler(client, TicketEvent.LOAD_TICKETS, this.loadTickets.bind(this));
        this.registerEventHandler(client, TicketEvent.LOAD_TICKET, this.loadTicket.bind(this));
        this.registerEventHandler(client, TicketEvent.LOAD_ARTICLE_ATTACHMENT, this.loadArticleAttachment.bind(this));
        this.registerEventHandler(
            client, TicketEvent.LOAD_ARTICLE_ZIP_ATTACHMENT, this.loadArticleZipAttachment.bind(this)
        );
        this.registerEventHandler(client, TicketEvent.REMOVE_ARTICLE_SEEN_FLAG, this.removeArticleSeenFlag.bind(this));
    }

    private async loadTickets(data: SearchTicketsRequest): Promise<CommunicatorResponse<SearchTicketsResponse>> {
        if (!data.properties) {
            data.properties = [];
        }

        if (!data.properties.find((p) => p === TicketProperty.TICKET_ID)) {
            data.properties.push(TicketProperty.TICKET_ID);
        }

        const tickets = await this.ticketService.loadTickets(
            data.token, data.properties, data.limit, data.andFilter, data.orFilter
        ).catch((error) => {
            return new CommunicatorResponse(TicketEvent.LOAD_TICKET_ERROR, error.errorMessage.body);
        });

        const response = new SearchTicketsResponse(data.requestId, tickets as Ticket[]);
        return new CommunicatorResponse(TicketEvent.LOAD_TICKETS_FINISHED, response);
    }

    private async loadTicket(data: LoadTicketRequest): Promise<CommunicatorResponse<LoadTicketResponse>> {
        const loadedTicket = await this.ticketService.loadTicket(data.token, data.ticketId, true, true);
        let contact: Contact;
        let customer: Customer;
        if (loadedTicket.CustomerUserID) {
            contact = await this.contactService.getContact(data.token, loadedTicket.CustomerUserID)
                .catch((error) => {
                    return undefined;
                });

            customer = await this.customerService.getCustomer(data.token, loadedTicket.CustomerID.toString())
                .catch((error) => {
                    return undefined;
                });
        }

        const ticket = TicketFactory.create(loadedTicket, customer, contact);
        const response = new LoadTicketResponse(ticket);
        return new CommunicatorResponse(TicketEvent.TICKET_LOADED, response);
    }

    private async loadArticleAttachment(
        data: LoadArticleAttachmentRequest
    ): Promise<CommunicatorResponse<LoadArticleAttachmentResponse>> {
        const attachemnt = await this.ticketService.loadArticleAttachment(
            data.token, data.ticketId, data.articleId, data.attachmentId
        );

        const response = new LoadArticleAttachmentResponse(attachemnt);
        return new CommunicatorResponse(TicketEvent.ARTICLE_ATTACHMENT_LOADED, response);
    }

    private async loadArticleZipAttachment(
        data: LoadArticleZipAttachmentRequest
    ): Promise<CommunicatorResponse<LoadArticleAttachmentResponse>> {
        const attachemnt = await this.ticketService.loadArticleZipAttachment(
            data.token, data.ticketId, data.articleId
        );

        const response = new LoadArticleAttachmentResponse(attachemnt);
        return new CommunicatorResponse(TicketEvent.ARTICLE_ZIP_ATTACHMENT_LOADED, response);
    }

    private async removeArticleSeenFlag(data: SetArticleSeenFlagRequest): Promise<CommunicatorResponse<void>> {
        await this.ticketService.setArticleSeenFlag(data.token, data.ticketId, data.articleId);
        return new CommunicatorResponse(TicketEvent.REMOVE_ARTICLE_SEEN_FLAG_DONE);
    }
}
