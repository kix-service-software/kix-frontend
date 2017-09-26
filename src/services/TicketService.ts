import {
    Article,
    ArticleAttachmentResponse,
    ArticleAttachmentsResponse,
    ArticleResponse,
    ArticlesResponse,
    Attachment,
    CreateArticle,
    CreateArticleAttachementResponse,
    CreateArticleAttachmentRequest,
    CreateArticleRequest,
    CreateArticleResponse,
    CreateAttachment,
    CreateTicket,
    CreateTicketRequest,
    CreateTicketResponse,
    DynamicField,
    IHttpService,
    ITicketService,
    Ticket,
    TicketHistory,
    TicketHistoryItemResponse,
    TicketHistoryResponse,
    TicketResponse,
    UpdateTicketRequest,
    UpdateTicketResponse
} from '@kix/core';
import { inject, injectable } from 'inversify';

import { HttpService } from './HttpService';
import { Response } from 'express';

const RESOURCE_TICKETS: string = "tickets";
const RESOURCE_ARTICLES: string = "articles";
const RESOURCE_ATTACHMENTS: string = "attachments";
const RESOURCE_HISTORY: string = "history";

@injectable()
export class TicketService implements ITicketService {

    private httpService: IHttpService;

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getTicket(token: string, id: number): Promise<Ticket> {
        const uri = this.buildUri(RESOURCE_TICKETS, id);
        const response = await this.httpService.get<TicketResponse>(uri, null, token);
        return response.Ticket;
    }

    public async createTicket(token: string, createTicket: CreateTicket): Promise<number> {
        const createTicketRequest = new CreateTicketRequest(createTicket);

        const response = await this.httpService.post<CreateTicketResponse>(
            RESOURCE_TICKETS, createTicketRequest, token
        );

        return response.TicketID;
    }

    public async createArticle(token: string, ticketId: number, createArticle: CreateArticle): Promise<number> {
        const createArticleRequest = new CreateArticleRequest(createArticle);
        const uri = this.buildUri(RESOURCE_TICKETS, ticketId, RESOURCE_ARTICLES);
        const response = await this.httpService.post<CreateArticleResponse>(uri, createArticleRequest, token);
        return response.ArticleID;
    }

    public async updateTicket(
        token: string, ticketId: number, title: string, customerUser: string, stateId: number,
        priorityId: number, queueId: number, lockId: number, typeId: number, serviceId: number,
        slaId: number, ownerId: number, responsibleId: number, pendingTime: number, dynamicFields: DynamicField[]
    ): Promise<number> {

        const updateRequest = new UpdateTicketRequest(
            title, customerUser, stateId, priorityId, queueId, lockId, typeId, serviceId,
            slaId, ownerId, responsibleId, pendingTime, dynamicFields);

        const uri = this.buildUri(RESOURCE_TICKETS, ticketId);
        const response = await this.httpService.patch<UpdateTicketResponse>(uri, updateRequest, token);
        return response.TicketID;
    }

    public async deleteTicket(token: string, ticketId: number): Promise<void> {
        const uri = this.buildUri(RESOURCE_TICKETS, ticketId);
        await this.httpService.delete(uri, token);
    }

    public async getArticles(token: string, ticketId: number): Promise<Article[]> {
        const uri = this.buildUri(RESOURCE_TICKETS, ticketId, RESOURCE_ARTICLES);
        const response = await this.httpService.get<ArticlesResponse>(uri, null, token);
        return response.Article;
    }

    public async getArticle(token: string, ticketId: number, articleId: number): Promise<Article> {
        const uri = this.buildUri(RESOURCE_TICKETS, ticketId, RESOURCE_ARTICLES, articleId);
        const response = await this.httpService.get<ArticleResponse>(uri, null, token);
        return response.Article;
    }

    public async getArticleAttachments(token: string, ticketId: number, articleId: number): Promise<Attachment[]> {
        const uri = this.buildUri(RESOURCE_TICKETS, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS);
        const response = await this.httpService.get<ArticleAttachmentsResponse>(uri, null, token);
        return response.Attachment;
    }

    public async getArticleAttachment(
        token: string, ticketId: number, articleId: number, attachmentId: number
    ): Promise<Attachment> {

        const uri = this.buildUri(
            RESOURCE_TICKETS, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS, attachmentId
        );

        const response = await this.httpService.get<ArticleAttachmentResponse>(uri, null, token);
        return response.Attachment;
    }

    public async createArticleAttachment(
        token: string, ticketId: number, articleId: number, content: string, contentType: string, filename: string
    ): Promise<number> {

        const createAttachmentRequest = new CreateArticleAttachmentRequest(
            new CreateAttachment(content, contentType, filename)
        );

        const uri = this.buildUri(RESOURCE_TICKETS, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS);
        const response = await this.httpService.post<CreateArticleAttachementResponse>(uri, createAttachmentRequest);
        return response.AttachmentID;
    }

    public async getTicketHistory(token: string, ticketId: number): Promise<TicketHistory[]> {
        const uri = this.buildUri(RESOURCE_TICKETS, ticketId, RESOURCE_HISTORY);
        const response = await this.httpService.get<TicketHistoryResponse>(uri, null, token);
        return response.History;
    }

    public async getTicketHistoryEntry(token: string, ticketId: number, historyId: number): Promise<TicketHistory> {
        const uri = this.buildUri(RESOURCE_TICKETS, ticketId, RESOURCE_HISTORY, historyId);
        const response = await this.httpService.get<TicketHistoryItemResponse>(uri, null, token);
        return response.History;
    }

    private buildUri(...args): string {
        return args.join('/');
    }

}
