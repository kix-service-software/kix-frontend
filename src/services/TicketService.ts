import { IHttpService } from '@kix/core/';
import { injectable, inject } from 'inversify';
import {
    CreateArticle,
    CreateArticleRequest,
    CreateArticleResponse,
    CreateTicket,
    DynamicField,
    ITicketService,
    History,
    Ticket,
    Article,
    Attachment,
    TicketResponse,
    CreateTicketRequest,
    CreateTicketResponse,
    UpdateTicketRequest,
    UpdateTicketResponse,
    ArticlesResponse,
    ArticleResponse
} from '@kix/core';

@injectable()
export class TicketService implements ITicketService {

    private httpService: IHttpService;

    private TICKETS_RESOURCE_URI: string = "tickets";

    public constructor( @inject("IHttpService") httpService: IHttpService) {
        this.httpService = httpService;
    }

    public async getTicket(token: string, id: number): Promise<Ticket> {
        const response = await this.httpService.get<TicketResponse>(this.TICKETS_RESOURCE_URI + '/' + id, null, token);
        return response.Ticket;
    }

    public async createTicket(token: string, createTicket: CreateTicket): Promise<number> {
        const createTicketRequest = new CreateTicketRequest(createTicket);

        const response = await this.httpService.post<CreateTicketResponse>(
            this.TICKETS_RESOURCE_URI, createTicketRequest, token
        );

        return response.TicketID;
    }

    public async createArticle(token: string, ticketId: number, createArticle: CreateArticle): Promise<number> {
        const createArticleRequest = new CreateArticleRequest(createArticle);

        const response = await this.httpService.post<CreateArticleResponse>(
            this.TICKETS_RESOURCE_URI + '/' + ticketId + '/articles', createArticleRequest, token
        );

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

        const response = await this.httpService.patch<UpdateTicketResponse>(
            this.TICKETS_RESOURCE_URI + '/' + ticketId, updateRequest, token
        );

        return response.TicketID;
    }

    public async deleteTicket(token: string, ticketId: number): Promise<void> {
        await this.httpService.delete(this.TICKETS_RESOURCE_URI + '/' + ticketId, token);
    }

    public async getArticles(token: string, ticketId: number): Promise<Article[]> {
        const response = await this.httpService.get<ArticlesResponse>(
            this.TICKETS_RESOURCE_URI + '/' + ticketId + '/articles', null, token
        );

        return response.Article;
    }

    public async getArticle(token: string, ticketId: number, articleId: number): Promise<Article> {
        const response = await this.httpService.get<ArticleResponse>(
            this.TICKETS_RESOURCE_URI + '/' + ticketId + '/articles/' + articleId, null, token
        );

        return response.Article;
    }

    public getArticleAttachments(token: string, ticketId: number, articleId: number): Promise<Attachment[]> {
        throw new Error("Method not implemented.");
    }

    public getArticleAttachment(
        token: string, ticketId: number, articleId: number, attachmentId: number
    ): Promise<Attachment> {
        throw new Error("Method not implemented.");
    }

    public createArticleAttachment(
        token: string, ticketId: number, articleId: number, content: string, contentType: string, filename: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public getTicketHistory(token: string, ticketId: number): Promise<History[]> {
        throw new Error("Method not implemented.");
    }

    public getTicketHistoryEntry(token: string, ticketId: number, historyId: number): Promise<History[]> {
        throw new Error("Method not implemented.");
    }

}
