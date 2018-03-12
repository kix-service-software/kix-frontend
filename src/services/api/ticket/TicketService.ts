import {
    ArticleAttachmentResponse, ArticleAttachmentsResponse, ArticleResponse, ArticlesResponse,
    ArticleTypesResponse, ArticleTypeResponse,
    CreateArticle, CreateArticleAttachementResponse, CreateArticleAttachmentRequest, CreateArticleRequest,
    CreateArticleResponse, CreateAttachment, CreateTicket, CreateTicketRequest, CreateTicketResponse,
    CreateQueue, CreateQueueRequest, CreateQueueResponse,
    LocksResponse,
    QueuesResponse, QueueResponse,
    TicketHistoryItemResponse, TicketHistoryResponse, TicketResponse, TicketsResponse, TicketQuery,
    TicketPrioritiesResponse, TicketStatesResponse, TicketTypesResponse, TicketStateTypesResponse,
    UpdateTicket, UpdateTicketRequest, UpdateTicketResponse, UpdateQueue, UpdateQueueResponse, UpdateQueueRequest
} from '@kix/core/dist/api';

import {
    Article, Attachment,
    DynamicField,
    StateType,
    Ticket, TicketHistory, TicketProperty, ArticleType, SortOrder, Queue, Lock, TicketPriority, TicketState, TicketType
} from '@kix/core/dist/model/';
import { TicketServiceUtil } from './TicketServiceUtil';

import { ITicketService } from '@kix/core/dist/services';

import { Response } from 'express';
import { inject, injectable } from 'inversify';

import { HttpService } from '../HttpService';
import { ObjectService } from '../ObjectService';
import { SearchOperator } from '@kix/core/dist/browser/SearchOperator';

const RESOURCE_ARTICLES: string = 'articles';
const RESOURCE_ATTACHMENTS: string = 'attachments';
const RESOURCE_HISTORY: string = 'history';

@injectable()
export class TicketService extends ObjectService<Ticket> implements ITicketService {

    protected RESOURCE_URI: string = 'tickets';

    public async getTicket(
        token: string, ticketId: number, articles: boolean = false, history: boolean = false
    ): Promise<Ticket> {
        let include = 'TimeUnits,DynamicFields,Links';
        let expand = 'Links';
        if (articles) {
            include += ',Articles,Attachments,Flags';
            expand += ',Articles,Attachments,Flags';
        }
        if (history) {
            include += ',History';
            expand += ',History';
        }

        const query: any = { fields: 'Ticket.*', include, expand };
        const response = await this.getObject<TicketResponse>(token, ticketId, query);
        return new Ticket(response.Ticket);
    }

    public async getTickets(
        token: string, properties: string[], limit: number,
        filter?: Array<[TicketProperty, SearchOperator, string | number | string[] | number[]]>,
        OR_SEARCH: boolean = false
    ): Promise<Ticket[]> {

        const ticketProperties = TicketServiceUtil.getTicketProperties(properties).join(',');
        const ticketFilter = TicketServiceUtil.prepareTicketFilter(filter, OR_SEARCH);
        const query = new TicketQuery(ticketProperties, ticketFilter);

        const response = await this.getObjects<TicketsResponse>(token, limit, null, null, query);
        return response.Ticket.map((t) => new Ticket(t));
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

    public async getArticles(token: string, ticketId: number): Promise<Article[]> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES);
        const response = await this.getObjectByUri<ArticlesResponse>(token, uri, {
            expand: 'Attachments',
            include: 'Attachments'
        });
        return response.Article.map((a) => {
            a.TicketID = ticketId;
            return a;
        });
    }

    public async getArticle(token: string, ticketId: number, articleId: number): Promise<Article> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId);
        const query = {
            include: 'Flags',
            expand: 'Flags'
        };
        const response = await this.getObjectByUri<ArticleResponse>(token, uri, query);
        response.Article.TicketID = ticketId;
        return response.Article;
    }

    public async getArticleAttachment(
        token: string, ticketId: number, articleId: number, attachmentId: number
    ): Promise<Attachment> {

        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS, attachmentId
        );

        const response = await this.getObjectByUri<ArticleAttachmentResponse>(token, uri, {
            include: 'Content'
        });
        return response.Attachment;
    }

    public async setArticleSeenFlag(token: string, ticketId: number, articleId: number): Promise<void> {
        const seenFlag = 'seen';
        const article = await this.getArticle(token, ticketId, articleId);

        const ArticleFlag = {
            Name: seenFlag,
            Value: '1'
        };

        if (this.articleHasFlag(article, seenFlag)) {
            const uri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId, 'flags', seenFlag);
            await this.updateObject(token, uri, { ArticleFlag });
        } else {
            const uri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId, 'flags');
            await this.createObject(token, uri, { ArticleFlag });
        }
    }

    private articleHasFlag(article: Article, flagName: string): boolean {
        return article.Flags && article.Flags.findIndex((f) => f.Name === flagName) !== -1;
    }

    // -----------------------------
    // ArticleTypes implementation
    // -----------------------------

    public async getArticleTypes(token: string): Promise<ArticleType[]> {
        const uri = this.buildUri('articletypes');
        const response = await this.getObjectByUri<ArticleTypesResponse>(token, uri);
        return response.ArticleType;
    }

    // -----------------------------
    // Queues implementation
    // -----------------------------

    public async getQueues(token: string): Promise<Queue[]> {
        const uri = this.buildUri('queues');
        const response = await this.getObjectByUri<QueuesResponse>(token, uri);
        return response.Queue;
    }

    public async getQueuesHierarchy(token: string): Promise<Queue[]> {
        const uri = this.buildUri('queues');
        const response = await this.getObjectByUri<QueuesResponse>(token, uri, {
            include: 'SubQueues',
            expand: 'SubQueues',
            filter: '{"Queue": {"AND": [{"Field": "ParentID", "Operator": "EQ", "Value": null}]}}'
        });
        return response.Queue;
    }

    // -----------------------------
    // TicketLock implementation
    // -----------------------------

    public async getLocks(token: string): Promise<Lock[]> {
        const uri = this.buildUri('ticketlocks');
        const response = await this.getObjectByUri<LocksResponse>(token, uri);
        return response.Lock;
    }

    // -----------------------------
    // TicketPriorities implementation
    // -----------------------------

    public async getTicketPriorities(token: string): Promise<TicketPriority[]> {
        const uri = this.buildUri('priorities');
        const response = await this.getObjectByUri<TicketPrioritiesResponse>(token, uri);
        return response.Priority;
    }

    // -----------------------------
    // TicketStates implementation
    // -----------------------------

    public async getTicketStates(token: string): Promise<TicketState[]> {
        const uri = this.buildUri('ticketstates');
        const response = await this.getObjectByUri<TicketStatesResponse>(token, uri);
        return response.TicketState;
    }

    public async getTicketStateTypes(token: string): Promise<StateType[]> {
        const uri = this.buildUri('statetypes');
        const response = await this.getObjectByUri<TicketStateTypesResponse>(token, uri);
        return response.StateType;
    }

    // -----------------------------
    // TicketTypes implementation
    // -----------------------------

    public async getTicketTypes(token: string): Promise<TicketType[]> {
        const uri = this.buildUri('tickettypes');
        const response = await this.getObjectByUri<TicketTypesResponse>(token, uri);
        return response.TicketType;
    }
}
