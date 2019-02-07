import {
    ArticleAttachmentResponse, ArticleResponse, ArticlesResponse,
    CreateArticle, CreateAttachment, CreateTicket, CreateTicketRequest, CreateTicketResponse, LocksResponse,
    QueuesResponse, SenderTypesResponse, TicketResponse, TicketsResponse,
    CreateWatcherRequest, CreateWatcherResponse, CreateWatcher,
    UpdateTicket, UpdateTicketResponse, UpdateTicketRequest, CreateArticleResponse, CreateArticleRequest
} from '../../../api';

import {
    Article, Attachment, ArticleProperty, FilterCriteria, Lock, Queue, SenderType, Ticket, TicketProperty,
    TicketFactory, KIXObjectType, FilterType, User, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    ArticlesLoadingOptions, KIXObjectSpecificCreateOptions, CreateTicketArticleOptions, CreateTicketWatcherOptions,
    KIXObjectSpecificDeleteOptions, DeleteTicketWatcherOptions, KIXObjectCache, TicketCacheHandler, Error
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { SearchOperator } from '../../../browser/SearchOperator';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { ConfigurationService } from '../ConfigurationService';
import { UserService } from './UserService';
import { LoggingService } from '../LoggingService';

const RESOURCE_ARTICLES: string = 'articles';
const RESOURCE_ATTACHMENTS: string = 'attachments';
const RESOURCE_WATCHERS: string = 'watchers';

export class TicketService extends KIXObjectService {

    private static INSTANCE: TicketService;

    public static getInstance(): TicketService {
        if (!TicketService.INSTANCE) {
            TicketService.INSTANCE = new TicketService();
        }
        return TicketService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'tickets';
    protected SUB_RESOURCE_URI: string = 'articles';

    public kixObjectType: KIXObjectType = KIXObjectType.TICKET;

    private constructor() {
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET
            || kixObjectType === KIXObjectType.ARTICLE
            || kixObjectType === KIXObjectType.QUEUE
            || kixObjectType === KIXObjectType.QUEUE_HIERARCHY
            || kixObjectType === KIXObjectType.SENDER_TYPE
            || kixObjectType === KIXObjectType.LOCK
            || kixObjectType === KIXObjectType.WATCHER;
    }

    public async initCache(): Promise<void> {
        const serverConfig = ConfigurationService.getInstance().getServerConfiguration();
        const token = serverConfig.BACKEND_API_TOKEN;

        KIXObjectCache.registerCacheHandler(new TicketCacheHandler());

        const cachePromises: Array<Promise<any>> = [
            this.getSenderTypes(token),
            this.getQueues(token),
            this.getQueuesHierarchy(token)
        ];

        await Promise.all(cachePromises);
    }

    public async loadObjects<T>(
        token: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.ARTICLE && objectLoadingOptions) {
            objects = await this.getArticles(token, loadingOptions, (objectLoadingOptions as ArticlesLoadingOptions));
        } else if (objectType === KIXObjectType.TICKET) {
            objects = await this.getTickets(token, objectIds, loadingOptions);
        } else if (objectType === KIXObjectType.QUEUE) {
            const queues = await this.getQueues(token);
            if (objectIds && objectIds.length) {
                objects = queues.filter((t) => objectIds.some((oid) => oid === t.ObjectId));
            } else {
                objects = queues;
            }
        } else if (objectType === KIXObjectType.QUEUE_HIERARCHY) {
            objects = await this.getQueuesHierarchy(token);
        } else if (objectType === KIXObjectType.SENDER_TYPE) {
            objects = await this.getSenderTypes(token);
        } else if (objectType === KIXObjectType.LOCK) {
            objects = await this.getLocks(token);
        }

        return objects;
    }

    public async getArticles(
        token: string, loadingOptions: KIXObjectLoadingOptions, articleOptions: ArticlesLoadingOptions
    ): Promise<Article[]> {
        let articles = [];
        let query = this.prepareQuery(loadingOptions);
        if (articleOptions.ticketId) {
            query = {
                ...query,
                sort: "Article.-CreateTime"
            };

            const uri = this.buildUri(this.RESOURCE_URI, articleOptions.ticketId, this.SUB_RESOURCE_URI);
            const response = await this.getObjectByUri<ArticlesResponse>(token, uri, query);

            articles = response.Article.map((a) => new Article(a));

            if (articleOptions.latest) {
                articles = [articles[0]];
            } else if (articleOptions.first) {
                articles.sort((a, b) => a.ArticleID - b.ArticleID);
                articles = [articles[0]];
            }
        }

        return articles;
    }

    private async getTickets(token: string, objectIds: Array<number | string>, loadingOptions: KIXObjectLoadingOptions
    ): Promise<Ticket[]> {
        const query = this.prepareQuery(loadingOptions);

        let tickets: Ticket[] = [];

        if (objectIds) {
            objectIds = objectIds.filter((id) => typeof id !== 'undefined' && id !== null && id.toString() !== '');
            if (objectIds.length === 1) {
                const response = await this.getObject<TicketResponse>(token, objectIds[0], query);
                tickets = [TicketFactory.create(response.Ticket)];
            } else if (objectIds.length > 0) {
                const uri = this.buildUri(this.RESOURCE_URI, objectIds.join(','));
                const response = await this.getObjectByUri<TicketsResponse>(token, uri, query);
                tickets = response.Ticket;
            }
        } else if (loadingOptions.filter) {
            await this.buildFilter(loadingOptions.filter, 'Ticket', token, query);
            const response = await this.getObjects<TicketsResponse>(token, loadingOptions.limit, null, null, query);
            tickets = response.Ticket;
        } else {
            const response = await this.getObjects<TicketsResponse>(token, loadingOptions.limit, null, null, query);
            tickets = response.Ticket;
        }

        return tickets.map((t) => TicketFactory.create(t));
    }

    public async createObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        if (objectType === KIXObjectType.TICKET) {
            const createArticle = await this.prepareArticleData(token, parameter);

            const createTicket = new CreateTicket(
                this.getParameterValue(parameter, TicketProperty.TITLE),
                this.getParameterValue(parameter, TicketProperty.CUSTOMER_USER_ID),
                this.getParameterValue(parameter, TicketProperty.CUSTOMER_ID),
                this.getParameterValue(parameter, TicketProperty.STATE_ID),
                this.getParameterValue(parameter, TicketProperty.PRIORITY_ID),
                this.getParameterValue(parameter, TicketProperty.QUEUE_ID),
                null,
                this.getParameterValue(parameter, TicketProperty.TYPE_ID),
                this.getParameterValue(parameter, TicketProperty.SERVICE_ID),
                this.getParameterValue(parameter, TicketProperty.SLA_ID),
                this.getParameterValue(parameter, TicketProperty.OWNER_ID),
                this.getParameterValue(parameter, TicketProperty.RESPONSIBLE_ID),
                this.getParameterValue(parameter, TicketProperty.PENDING_TIME),
                null,
                [createArticle]
            );

            const response = await this.sendCreateRequest<CreateTicketResponse, CreateTicketRequest>(
                token, this.RESOURCE_URI, new CreateTicketRequest(createTicket)
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            await this.createLinks(token, response.TicketID, this.getParameterValue(parameter, TicketProperty.LINK));

            return response.TicketID;
        } else if (objectType === KIXObjectType.ARTICLE) {
            const options = createOptions as CreateTicketArticleOptions;
            const createArticle = await this.prepareArticleData(token, parameter);
            const uri = this.buildUri(this.RESOURCE_URI, options.ticketId, this.SUB_RESOURCE_URI);
            const response = await this.sendCreateRequest<CreateArticleResponse, CreateArticleRequest>(
                token, uri, new CreateArticleRequest(createArticle)
            );
            return response.ArticleID;
        } else if (objectType === KIXObjectType.WATCHER) {
            const watcherOptions = createOptions as CreateTicketWatcherOptions;
            return this.addWatcher(token, watcherOptions.ticketId, watcherOptions.userId);
        }
    }

    public async deleteObject(
        token: string, objectType: KIXObjectType, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions
    ): Promise<void> {
        if (objectType === KIXObjectType.WATCHER) {
            const watcherOptions = deleteOptions as DeleteTicketWatcherOptions;
            this.removeWatcher(token, Number(objectId), watcherOptions.ticketId);
        }
    }

    public async updateObject(
        token: string, objectType: KIXObjectType, parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const createArticle = await this.prepareArticleData(token, parameter);

        const updateTicket = new UpdateTicket(
            this.getParameterValue(parameter, TicketProperty.TITLE),
            this.getParameterValue(parameter, TicketProperty.CUSTOMER_USER_ID),
            this.getParameterValue(parameter, TicketProperty.CUSTOMER_ID),
            this.getParameterValue(parameter, TicketProperty.STATE_ID),
            this.getParameterValue(parameter, TicketProperty.PRIORITY_ID),
            this.getParameterValue(parameter, TicketProperty.QUEUE_ID),
            this.getParameterValue(parameter, TicketProperty.LOCK_ID),
            this.getParameterValue(parameter, TicketProperty.TYPE_ID),
            this.getParameterValue(parameter, TicketProperty.SERVICE_ID),
            this.getParameterValue(parameter, TicketProperty.SLA_ID),
            this.getParameterValue(parameter, TicketProperty.OWNER_ID),
            this.getParameterValue(parameter, TicketProperty.RESPONSIBLE_ID),
            this.getParameterValue(parameter, TicketProperty.PENDING_TIME),
            null,
        );

        const response = await this.sendUpdateRequest<UpdateTicketResponse, UpdateTicketRequest>(
            token, this.buildUri(this.RESOURCE_URI, objectId), new UpdateTicketRequest(updateTicket)
        ).catch((error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        if (createArticle) {
            const articleResponse = await this.sendCreateRequest<CreateArticleResponse, CreateArticleRequest>(
                token, this.buildUri(this.RESOURCE_URI, objectId, this.SUB_RESOURCE_URI),
                new CreateArticleRequest(createArticle)
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return response.TicketID;
    }

    private async prepareArticleData(token: string, parameter: Array<[string, any]>): Promise<CreateArticle> {
        const attachments = this.createAttachments(this.getParameterValue(parameter, ArticleProperty.ATTACHMENTS));

        let senderType = this.getParameterValue(parameter, ArticleProperty.SENDER_TYPE_ID);
        if (!senderType) {
            senderType = 1;
        }

        let from = this.getParameterValue(parameter, ArticleProperty.FROM);
        if (!from) {
            const user = await UserService.getInstance().getUserByToken(token);
            from = user.UserLogin;
        }

        const subject = this.getParameterValue(parameter, ArticleProperty.SUBJECT);
        const body = this.getParameterValue(parameter, ArticleProperty.BODY);

        let createArticle;
        if (subject && body) {
            createArticle = new CreateArticle(
                subject, body, 'text/html; charset=utf8', 'text/html', 'utf8',
                null, senderType, null, from, null, null, null, null, null, null, null, null,
                attachments.length ? attachments : null
            );
        }
        return createArticle;
    }

    private createAttachments(attachments: Attachment[]): CreateAttachment[] {
        const result = [];
        if (attachments) {
            attachments.forEach((a) => result.push(new CreateAttachment(a.Content, a.ContentType, a.Filename)));
        }
        return result;
    }

    public async loadArticle(token: string, ticketId: number, articleId: number): Promise<Article> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId);
        const query = {
            include: 'Flags',
            expand: 'Flags'
        };
        const response = await this.getObjectByUri<ArticleResponse>(token, uri, query);
        response.Article.TicketID = ticketId;
        return response.Article;
    }

    public async loadArticleAttachment(
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

    public async loadArticleZipAttachment(token: string, ticketId: number, articleId: number): Promise<Attachment> {
        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, RESOURCE_ARTICLES, articleId, RESOURCE_ATTACHMENTS, 'zip'
        );

        const response = await this.getObjectByUri<ArticleAttachmentResponse>(token, uri, {
            include: 'Content'
        });
        return response.Attachment;
    }

    public async setArticleSeenFlag(token: string, ticketId: number, articleId: number): Promise<void> {
        const seenFlag = 'Seen';
        const article = await this.loadArticle(token, ticketId, articleId);

        const ArticleFlag = {
            Name: seenFlag,
            Value: '1'
        };

        if (this.articleHasFlag(article, seenFlag)) {
            const uri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId, 'flags', seenFlag);
            await this.sendUpdateRequest(token, uri, { ArticleFlag });
        } else {
            const uri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId, 'flags');
            await this.sendCreateRequest(token, uri, { ArticleFlag });
        }
    }

    public async getTicketCountForContact(token: string, contactId: string, stateTypeIds: number[]): Promise<number> {
        const query = {
            filter: {
                Ticket: {
                    AND: [
                        { Field: TicketProperty.CUSTOMER_USER_ID, Operator: SearchOperator.EQUALS, Value: contactId },
                        { Field: TicketProperty.TYPE_ID, Operator: SearchOperator.IN, Value: stateTypeIds }
                    ]
                }
            }
        };

        const response = await this.getObjects<TicketsResponse>(token, null, null, null, query);
        return response.Ticket.length;
    }

    private articleHasFlag(article: Article, flagName: string): boolean {
        return article.Flags && article.Flags.findIndex((f) => f.Name === flagName) !== -1;
    }

    // -----------------------------
    // SenderTypes implementation
    // -----------------------------

    public async getSenderTypes(token: string): Promise<SenderType[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.SENDER_TYPE)) {
            const uri = this.buildUri('sendertypes');
            const response = await this.getObjectByUri<SenderTypesResponse>(token, uri);
            response.SenderType
                .map((st) => new SenderType(st))
                .forEach((st) => KIXObjectCache.addObject(KIXObjectType.SENDER_TYPE, st));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.SENDER_TYPE);
    }

    // -----------------------------
    // Queues implementation
    // -----------------------------

    public async getQueues(token: string): Promise<Queue[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.QUEUE)) {
            const uri = this.buildUri('queues');
            const response = await this.getObjectByUri<QueuesResponse>(token, uri);
            response.Queue
                .map((q) => new Queue(q))
                .forEach((q) => KIXObjectCache.addObject(KIXObjectType.QUEUE, q));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.QUEUE);
    }

    public async getQueuesHierarchy(token: string): Promise<Queue[]> {
        if (!KIXObjectCache.hasObjectCache(KIXObjectType.QUEUE_HIERARCHY)) {
            const uri = this.buildUri('queues');
            const response = await this.getObjectByUri<QueuesResponse>(token, uri, {
                include: 'SubQueues,TicketStats,Tickets',
                expand: 'SubQueues',
                filter: '{"Queue": {"AND": [{"Field": "ParentID", "Operator": "EQ", "Value": null}]}}'
            });
            response.Queue
                .map((q) => new Queue(q))
                .forEach((qh) => KIXObjectCache.addObject(KIXObjectType.QUEUE_HIERARCHY, qh));
        }
        return KIXObjectCache.getObjectCache(KIXObjectType.QUEUE_HIERARCHY);
    }

    // -----------------------------
    // TicketLock implementation
    // -----------------------------

    public async getLocks(token: string): Promise<Lock[]> {
        const uri = this.buildUri('ticketlocks');
        const response = await this.getObjectByUri<LocksResponse>(token, uri);
        return response.Lock.map((l) => new Lock(l));
    }

    // -----------------------------
    // Watchers implementation
    // -----------------------------

    public async addWatcher(token: string, ticketId: number, userId: number): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_WATCHERS);
        const createWatcher = new CreateWatcher(userId);
        const response = await this.sendCreateRequest<CreateWatcherResponse, CreateWatcherRequest>(
            token, uri, new CreateWatcherRequest(createWatcher)
        ).catch((error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return response.WatcherID;
    }

    public async removeWatcher(token: string, ticketId: number, watcherId: number): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_WATCHERS, watcherId);
        await this.sendDeleteRequest<void>(token, uri);
    }

    // Overrides from KIXObjectService

    // FIXME: unterschiedliche Behandlung von Filter und Search entfernen, sollte nicht notwendig sein
    protected async buildFilter(
        filter: FilterCriteria[], filterProperty: string, token: string, query: any
    ): Promise<void> {
        let objectFilter = {};
        let objectSearch = {};

        const user = await UserService.getInstance().getUserByToken(token);

        const andFilter = filter.filter(
            (f) => f.filterType === FilterType.AND && f.property !== 'StateType'
        ).map((f) => {
            this.setUserID(f, user);
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });
        const andSearch = filter.filter(
            (f) => f.filterType === FilterType.AND && f.operator !== SearchOperator.NOT_EQUALS
        ).map((f) => {
            this.setUserID(f, user);
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (andFilter && andFilter.length) {
            objectFilter = {
                AND: andFilter
            };
        }
        if (andSearch && andSearch.length) {
            objectSearch = {
                AND: andSearch
            };
        }

        const orFilter = filter.filter(
            (f) => f.filterType === FilterType.OR && f.property !== 'StateType'
        ).map((f) => {
            this.setUserID(f, user);
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });
        const orSearch = filter.filter(
            (f) => f.filterType === FilterType.OR && f.operator !== SearchOperator.NOT_EQUALS
        ).map((f) => {
            this.setUserID(f, user);
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });

        if (orFilter && orFilter.length) {
            objectFilter = {
                ...objectFilter,
                OR: orFilter
            };
        }
        if (orSearch && orSearch.length) {
            objectSearch = {
                ...objectSearch,
                OR: orSearch
            };
        }

        if ((andFilter && andFilter.length) || (orFilter && orFilter.length)) {
            const apiFilter = {};
            apiFilter[filterProperty] = objectFilter;
            query.filter = JSON.stringify(apiFilter);
        }
        if ((andSearch && andSearch.length) || (orSearch && orSearch.length)) {
            const search = {};
            search[filterProperty] = objectSearch;
            query.search = JSON.stringify(search);
        }
    }

    private setUserID(filter: FilterCriteria, user: User): void {
        if (filter.property === TicketProperty.OWNER_ID || filter.property === TicketProperty.RESPONSIBLE_ID) {
            if (filter.value === 'CURRENT_USER') {
                filter.value = user.UserID;
            }
        }
    }
}
