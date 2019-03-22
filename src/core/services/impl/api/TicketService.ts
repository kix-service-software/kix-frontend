import {
    ArticleAttachmentResponse, CreateArticle, CreateAttachment, CreateTicket, CreateTicketRequest, CreateTicketResponse,
    CreateWatcherRequest, CreateWatcherResponse, CreateWatcher,
    UpdateTicket, UpdateTicketResponse, UpdateTicketRequest, CreateArticleResponse, CreateArticleRequest
} from '../../../api';

import {
    Article, Attachment, ArticleProperty, FilterCriteria, Queue, TicketProperty,
    TicketFactory, KIXObjectType, FilterType, User, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, CreateTicketArticleOptions, CreateTicketWatcherOptions,
    KIXObjectSpecificDeleteOptions, DeleteTicketWatcherOptions, Error, QueueFactory,
    SenderTypeFactory, ArticleFactory, LockFactory
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { SearchOperator } from '../../../browser/SearchOperator';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { UserService } from './UserService';
import { LoggingService } from '../LoggingService';
import { ChannelService } from './ChannelService';
import { ContactService } from './ContactService';

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

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    private constructor() {
        super([
            new TicketFactory(),
            new QueueFactory(),
            new SenderTypeFactory(),
            new ArticleFactory(),
            new LockFactory()
        ]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET
            || kixObjectType === KIXObjectType.ARTICLE
            || kixObjectType === KIXObjectType.QUEUE
            || kixObjectType === KIXObjectType.SENDER_TYPE
            || kixObjectType === KIXObjectType.LOCK
            || kixObjectType === KIXObjectType.WATCHER;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TICKET) {
            objects = await super.load(
                token, KIXObjectType.TICKET, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.TICKET
            );
        } else if (objectType === KIXObjectType.QUEUE) {
            objects = await super.load(token, KIXObjectType.QUEUE, 'queues', loadingOptions, null, KIXObjectType.QUEUE);
        } else if (objectType === KIXObjectType.SENDER_TYPE) {
            objects = await super.load(token, KIXObjectType.SENDER_TYPE, 'sendertypes', null, null, 'SenderType');
        } else if (objectType === KIXObjectType.LOCK) {
            objects = await super.load(token, KIXObjectType.LOCK, 'ticketlocks', null, null, 'Lock');
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        if (objectType === KIXObjectType.TICKET) {
            const queueId = this.getParameterValue(parameter, TicketProperty.QUEUE_ID);
            const contactId = this.getParameterValue(parameter, TicketProperty.CUSTOMER_USER_ID);

            const createArticle = await this.prepareArticleData(token, parameter, queueId, contactId);

            const createTicket = new CreateTicket(
                this.getParameterValue(parameter, TicketProperty.TITLE),
                this.getParameterValue(parameter, TicketProperty.CUSTOMER_USER_ID),
                this.getParameterValue(parameter, TicketProperty.CUSTOMER_ID),
                this.getParameterValue(parameter, TicketProperty.STATE_ID),
                this.getParameterValue(parameter, TicketProperty.PRIORITY_ID),
                queueId,
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
                token, clientRequestId, this.RESOURCE_URI, new CreateTicketRequest(createTicket), this.objectType
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            await this.createLinks(
                token, clientRequestId, response.TicketID, this.getParameterValue(parameter, TicketProperty.LINK)
            );

            return response.TicketID;
        } else if (objectType === KIXObjectType.ARTICLE) {
            const options = createOptions as CreateTicketArticleOptions;

            let queueId;
            const tickets = await super.load(
                token, KIXObjectType.TICKET, this.RESOURCE_URI, null, [options.ticketId], KIXObjectType.TICKET
            );
            if (tickets && tickets.length) {
                queueId = tickets[0].QueueID;
            }

            const createArticle = await this.prepareArticleData(token, parameter, queueId);
            const uri = this.buildUri(this.RESOURCE_URI, options.ticketId, this.SUB_RESOURCE_URI);
            const response = await this.sendCreateRequest<CreateArticleResponse, CreateArticleRequest>(
                token, clientRequestId, uri, new CreateArticleRequest(createArticle), this.objectType
            );
            return response.ArticleID;
        } else if (objectType === KIXObjectType.WATCHER) {
            const watcherOptions = createOptions as CreateTicketWatcherOptions;
            return this.addWatcher(token, clientRequestId, watcherOptions.ticketId, watcherOptions.userId);
        }
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectId: string | number,
        deleteOptions: KIXObjectSpecificDeleteOptions
    ): Promise<void> {
        if (objectType === KIXObjectType.WATCHER) {
            const watcherOptions = deleteOptions as DeleteTicketWatcherOptions;
            this.removeWatcher(token, clientRequestId, Number(objectId), watcherOptions.ticketId);
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const queueId = this.getParameterValue(parameter, TicketProperty.QUEUE_ID);

        const createArticle = await this.prepareArticleData(token, parameter, queueId);

        const updateTicket = new UpdateTicket(
            this.getParameterValue(parameter, TicketProperty.TITLE),
            this.getParameterValue(parameter, TicketProperty.CUSTOMER_USER_ID),
            this.getParameterValue(parameter, TicketProperty.CUSTOMER_ID),
            this.getParameterValue(parameter, TicketProperty.STATE_ID),
            this.getParameterValue(parameter, TicketProperty.PRIORITY_ID),
            queueId,
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
            token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId), new UpdateTicketRequest(updateTicket),
            this.objectType
        ).catch((error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        if (createArticle) {
            await this.sendCreateRequest<CreateArticleResponse, CreateArticleRequest>(
                token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId, this.SUB_RESOURCE_URI),
                new CreateArticleRequest(createArticle), this.objectType
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return response.TicketID;
    }

    private async prepareArticleData(
        token: string, parameter: Array<[string, any]>, queueId: number, contactId?: string
    ): Promise<CreateArticle> {
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

        const channelId = this.getParameterValue(parameter, ArticleProperty.CHANNEL_ID);
        const subject = this.getParameterValue(parameter, ArticleProperty.SUBJECT);
        let body = this.getParameterValue(parameter, ArticleProperty.BODY);
        const customerVisible = this.getParameterValue(parameter, ArticleProperty.CUSTOMER_VISIBLE);
        let to = this.getParameterValue(parameter, ArticleProperty.TO);
        if (!to && contactId) {
            const contact = await ContactService.getInstance().getContact(token, contactId);
            if (contact) {
                to = contact.UserEmail;
            }
        }
        const cc = this.getParameterValue(parameter, ArticleProperty.CC);
        const bcc = this.getParameterValue(parameter, ArticleProperty.BCC);

        const channels = await ChannelService.getInstance().getChannels(token);
        const channel = channels.find((c) => c.ID === channelId);
        if (channel && channel.Name === 'email') {
            if (queueId) {
                const queues = await super.load<Queue>(
                    token, KIXObjectType.QUEUE, 'queues', null, null, KIXObjectType.QUEUE
                );
                const queue = queues.find((q) => q.QueueID === queueId);
                if (queue && queue.Signature) {
                    body += `\n<p>--</p>\n${queue.Signature}`;
                }
            }
        }

        let createArticle: CreateArticle;
        if (channelId && subject && body) {
            createArticle = new CreateArticle(
                subject, body, 'text/html; charset=utf8', 'text/html', 'utf8',
                channelId, senderType, null, from, null, null, null, null, null, null, null, null,
                attachments.length ? attachments : null,
                customerVisible !== undefined ? customerVisible : false,
                to, cc, bcc
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

    public async setArticleSeenFlag(
        token: string, clientRequestId: string, ticketId: number, articleId: number
    ): Promise<void> {
        const seenFlag = 'Seen';

        const baseUri = this.buildUri(this.RESOURCE_URI, ticketId, this.SUB_RESOURCE_URI, articleId);
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, null, null, [ArticleProperty.FLAGS], [ArticleProperty.FLAGS]
        );

        const articles = await super.load<Article>(
            token, KIXObjectType.ARTICLE, baseUri, loadingOptions, null, 'Article'
        );

        const article = articles && articles.length ? articles[0] : null;

        const ArticleFlag = {
            Name: seenFlag,
            Value: '1'
        };

        if (article && this.articleHasFlag(article, seenFlag)) {
            const uri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId, 'flags', seenFlag);
            await this.sendUpdateRequest(token, clientRequestId, uri, { ArticleFlag }, this.objectType);
        } else {
            const uri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId, 'flags');
            await this.sendCreateRequest(token, clientRequestId, uri, { ArticleFlag }, this.objectType);
        }
    }

    private articleHasFlag(article: Article, flagName: string): boolean {
        return article.Flags && article.Flags.findIndex((f) => f.Name === flagName) !== -1;
    }

    // -----------------------------
    // Watchers implementation
    // -----------------------------

    public async addWatcher(token: string, clientRequestId: string, ticketId: number, userId: number): Promise<number> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_WATCHERS);
        const createWatcher = new CreateWatcher(userId);
        const response = await this.sendCreateRequest<CreateWatcherResponse, CreateWatcherRequest>(
            token, clientRequestId, uri, new CreateWatcherRequest(createWatcher), this.objectType
        ).catch((error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return response.WatcherID;
    }

    public async removeWatcher(
        token: string, clientRequestId: string, ticketId: number, watcherId: number
    ): Promise<void> {
        const uri = this.buildUri(this.RESOURCE_URI, ticketId, RESOURCE_WATCHERS, watcherId);
        await this.sendDeleteRequest<void>(token, clientRequestId, uri, this.objectType);
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
            if (filter.value === KIXObjectType.CURRENT_USER) {
                filter.value = user.UserID;
            }
        }
    }
}
