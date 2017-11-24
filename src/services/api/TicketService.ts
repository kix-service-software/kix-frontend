import {
    ArticleAttachmentResponse,
    ArticleAttachmentsResponse,
    ArticleResponse,
    ArticlesResponse,
    CreateArticle,
    CreateArticleAttachementResponse,
    CreateArticleAttachmentRequest,
    CreateArticleRequest,
    CreateArticleResponse,
    CreateAttachment,
    CreateTicket,
    CreateTicketRequest,
    CreateTicketResponse,
    ExpandedTicketResponse,
    TicketHistoryItemResponse,
    TicketHistoryResponse,
    TicketResponse,
    TicketsResponse,
    TicketQuery,
    UpdateTicket,
    UpdateTicketRequest,
    UpdateTicketResponse
} from '@kix/core/dist/api';

import {
    DynamicField,
    AbstractTicket,
    Article,
    Attachment,
    Ticket,
    TicketHistory,
    TicketProperty
} from '@kix/core/dist/model/';

import { ITicketService } from '@kix/core/dist/services';

import { Response } from 'express';
import { inject, injectable } from 'inversify';

import { HttpService } from './HttpService';
import { ObjectService } from './ObjectService';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';

const RESOURCE_ARTICLES: string = "articles";
const RESOURCE_ATTACHMENTS: string = "attachments";
const RESOURCE_HISTORY: string = "history";

@injectable()
export class TicketService extends ObjectService<Ticket> implements ITicketService {

    protected RESOURCE_URI: string = "tickets";

    public async getTicket(token: string, ticketId: number, expandArticles: boolean = true): Promise<AbstractTicket> {
        let query = {};

        if (expandArticles) {
            query = {
                fields: 'Ticket.*',
                include: 'Articles',
                expand: 'Ticket.Articles'
            };

            const response = await this.getObject<ExpandedTicketResponse>(
                token, ticketId, query
            );
            return response.Ticket;
        } else {
            const response = await this.getObject<TicketResponse>(token, ticketId);
            return response.Ticket;
        }
    }

    public async getTickets(
        token: string, properties: string[], limit: number,
        filter?: Array<[TicketProperty, SearchOperator, string[]]>
    ): Promise<AbstractTicket[]> {

        const ticketProperties = this.getTicketProperties(properties).join(',');
        const ticketFilter = this.prepareTicketFilter(filter);
        const query = new TicketQuery(ticketProperties, ticketFilter);

        const response = await this.getObjects<TicketsResponse>(token, limit, null, null, query);
        return response.Ticket;
    }

    public async createTicket(token: string, createTicket: CreateTicket): Promise<number> {
        const createTicketRequest = new CreateTicketRequest(createTicket);

        const response = await this.createObject<CreateTicketResponse, CreateTicketRequest>(
            token, this.RESOURCE_URI, createTicketRequest
        );

        return response.TicketID;
    }

    public async createArticle(token: string, ticketId: number, createArticle: CreateArticle): Promise<number> {
        const createArticleRequest = new CreateArticleRequest(createArticle);
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES);

        const response = await this.createObject<CreateArticleResponse, CreateArticleRequest>(
            token, uri, createArticleRequest
        );

        return response.ArticleID;
    }

    public async updateTicket(token: string, ticketId: number, updateTicket: UpdateTicket): Promise<number> {
        const updateRequest = new UpdateTicketRequest(updateTicket);
        const uri = this.buildUri(this.RESOURCE_URI, ticketId);

        const response = await this.updateObject<UpdateTicketResponse, UpdateTicketRequest>(token, uri, updateRequest);

        return response.TicketID;
    }

    public async deleteTicket(token: string, ticketId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId);
        await this.deleteObject(token, uri);
    }

    public async getArticles(token: string, ticketId: number): Promise<Article[]> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES);
        const response = await this.getObjectByUri<ArticlesResponse>(token, uri);
        return response.Article;
    }

    public async getArticle(token: string, ticketId: number, articleId: number): Promise<Article> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId);
        const response = await this.getObjectByUri<ArticleResponse>(token, uri);
        return response.Article;
    }

    public async getArticleAttachments(token: string, ticketId: number, articleId: number): Promise<Attachment[]> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS);
        const response = await this.getObjectByUri<ArticleAttachmentsResponse>(token, uri);
        return response.Attachment;
    }

    public async getArticleAttachment(
        token: string, ticketId: number, articleId: number, attachmentId: number
    ): Promise<Attachment> {

        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS, attachmentId
        );

        const response = await this.getObjectByUri<ArticleAttachmentResponse>(token, uri);
        return response.Attachment;
    }

    public async createArticleAttachment(
        token: string, ticketId: number, articleId: number, content: string, contentType: string, filename: string
    ): Promise<number> {

        const createAttachmentRequest = new CreateArticleAttachmentRequest(
            new CreateAttachment(content, contentType, filename)
        );

        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS);

        const response = await this.createObject<CreateArticleAttachementResponse, CreateArticleAttachmentRequest>(
            token, uri, createAttachmentRequest
        );

        return response.AttachmentID;
    }

    public async getTicketHistory(token: string, ticketId: number): Promise<TicketHistory[]> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_HISTORY);
        const response = await this.getObjectByUri<TicketHistoryResponse>(token, uri);
        return response.History;
    }

    public async getTicketHistoryEntry(token: string, ticketId: number, historyId: number): Promise<TicketHistory> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_HISTORY, historyId);
        const response = await this.getObjectByUri<TicketHistoryItemResponse>(token, uri);
        return response.History;
    }

    private getTicketProperties(properties: string[]): string[] {
        const ticketProperties = [];
        if (properties) {
            for (let property of properties) {
                if (!property.startsWith("Ticket.")) {
                    property = "Ticket." + property;
                }
                ticketProperties.push(property);
            }
        }
        return ticketProperties;
    }

    private prepareTicketFilter(ticketFilter: Array<[TicketProperty, SearchOperator, string[]]>): string {
        let filter = "";
        if (ticketFilter && ticketFilter.length) {
            const filterObject = {
                Ticket: this.prepareFilterOperations(ticketFilter)
            };

            filter = JSON.stringify(filterObject);
        }
        return filter;
    }

    private prepareFilterOperations(ticketFilter: Array<[TicketProperty, SearchOperator, string[]]>): any {
        const filterObject = {};
        const filterOperations = [];
        for (const filter of ticketFilter) {
            if (this.isNumericSearchOperation(filter[1])) {
                filterOperations.push({
                    Field: filter[0],
                    Operator: filter[1],
                    Value: Number(filter[2][0]),
                    Type: "numeric"
                });
            } else if (this.isINSearch(filter[1])) {
                filterOperations.push({
                    Field: filter[0],
                    Operator: filter[1],
                    Value: filter[2][0].split(" "),
                    Type: "numeric"
                });
            } else {
                filterOperations.push({
                    Field: filter[0],
                    Operator: filter[1],
                    Value: filter[2].join(" ")
                });
            }
        }

        filterObject['AND'] = filterOperations;

        return filterObject;
    }

    private isNumericSearchOperation(operator: SearchOperator): boolean {
        return (
            operator === SearchOperator.LESS_THAN ||
            operator === SearchOperator.LESS_THAN_OR_EQUAL ||
            operator === SearchOperator.GREATER_THAN ||
            operator === SearchOperator.GREATER_THAN_OR_EQUAL
        );
    }

    private isINSearch(operator: SearchOperator): boolean {
        return operator === SearchOperator.IN;
    }
}
