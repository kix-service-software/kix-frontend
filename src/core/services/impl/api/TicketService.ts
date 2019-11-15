/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    ArticleAttachmentResponse, CreateArticle, CreateAttachment, CreateTicket, CreateTicketRequest, CreateTicketResponse,
    CreateWatcherRequest, CreateWatcherResponse, CreateWatcher,
    UpdateTicket, UpdateTicketResponse, UpdateTicketRequest, CreateArticleResponse, CreateArticleRequest
} from '../../../api';

import {
    Article, Attachment, ArticleProperty, FilterCriteria, TicketProperty,
    KIXObjectType, FilterType, User, KIXObjectLoadingOptions, KIXObjectSpecificLoadingOptions,
    KIXObjectSpecificCreateOptions, CreateTicketArticleOptions, CreateTicketWatcherOptions,
    KIXObjectSpecificDeleteOptions, Error, Contact, KIXObjectProperty, FilterDataType
} from '../../../model';

import { KIXObjectService } from './KIXObjectService';
import { SearchOperator } from '../../../browser/SearchOperator';
import { KIXObjectServiceRegistry } from '../../KIXObjectServiceRegistry';
import { UserService } from './UserService';
import { LoggingService } from '../LoggingService';
import { TicketFactory } from '../../object-factories/TicketFactory';
import { SenderTypeFactory } from '../../object-factories/SenderTypeFactory';
import { LockFactory } from '../../object-factories/LockFactory';
import { ArticleFactory } from '../../object-factories/ArticleFactory';
import { ArticleLoadingOptions } from '../../../model/kix/ticket/ArticleLoadingOptions';

export class TicketService extends KIXObjectService {

    private static INSTANCE: TicketService;

    public static getInstance(): TicketService {
        if (!TicketService.INSTANCE) {
            TicketService.INSTANCE = new TicketService();
        }
        return TicketService.INSTANCE;
    }

    protected RESOURCE_URI: string = 'tickets';

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    private constructor() {
        super([
            new TicketFactory(),
            new SenderTypeFactory(),
            new ArticleFactory(),
            new LockFactory()
        ]);
        KIXObjectServiceRegistry.registerServiceInstance(this);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET
            || kixObjectType === KIXObjectType.ARTICLE
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
            if (!loadingOptions) {
                loadingOptions = new KIXObjectLoadingOptions(null, null, null, [TicketProperty.STATE_TYPE]);
            } else if (loadingOptions.includes) {
                loadingOptions.includes.push(TicketProperty.STATE_TYPE);
            } else {
                loadingOptions.includes = [TicketProperty.STATE_TYPE];
            }

            objects = await super.load(
                token, KIXObjectType.TICKET, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.TICKET
            );
        } else if (objectType === KIXObjectType.SENDER_TYPE) {
            const uri = this.buildUri('system', 'communication', 'sendertypes');
            objects = await super.load(token, KIXObjectType.SENDER_TYPE, uri, null, null, 'SenderType');
        } else if (objectType === KIXObjectType.LOCK) {
            const uri = this.buildUri('system', 'ticket', 'locks');
            objects = await super.load(token, KIXObjectType.LOCK, uri, null, null, 'Lock');
        } else if (objectType === KIXObjectType.ARTICLE) {
            if (objectLoadingOptions) {
                const uri = this.buildUri(
                    this.RESOURCE_URI, (objectLoadingOptions as ArticleLoadingOptions).ticketId, 'articles'
                );
                objects = await super.load(token, KIXObjectType.ARTICLE, uri, loadingOptions, objectIds, 'Article');
            }
        }

        return objects;
    }

    public async createObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, parameter: Array<[string, any]>,
        createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<number> {
        if (objectType === KIXObjectType.TICKET) {
            const queueId = this.getParameterValue(parameter, TicketProperty.QUEUE_ID);
            const contactId = this.getParameterValue(parameter, TicketProperty.CONTACT_ID);

            const createArticle = await this.prepareArticleData(token, clientRequestId, parameter, queueId, contactId);

            const createTicket = new CreateTicket(
                this.getParameterValue(parameter, TicketProperty.TITLE),
                this.getParameterValue(parameter, TicketProperty.CONTACT_ID),
                this.getParameterValue(parameter, TicketProperty.ORGANISATION_ID),
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

            const createArticle = await this.prepareArticleData(token, clientRequestId, parameter, queueId);
            const uri = this.buildUri(this.RESOURCE_URI, options.ticketId, 'articles');
            const response = await this.sendCreateRequest<CreateArticleResponse, CreateArticleRequest>(
                token, clientRequestId, uri, new CreateArticleRequest(createArticle), KIXObjectType.ARTICLE
            );
            return response.ArticleID;
        } else if (objectType === KIXObjectType.WATCHER) {
            const watcherOptions = createOptions as CreateTicketWatcherOptions;
            return this.addWatcher(token, clientRequestId, watcherOptions.ticketId, watcherOptions.userId);
        }
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectId: number,
        deleteOptions: KIXObjectSpecificDeleteOptions
    ): Promise<Error[]> {
        if (objectType === KIXObjectType.WATCHER) {
            return this.removeWatcher(token, clientRequestId, objectId);
        }
    }

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number | string
    ): Promise<string | number> {
        const queueId = this.getParameterValue(parameter, TicketProperty.QUEUE_ID);

        const createArticle = await this.prepareArticleData(token, clientRequestId, parameter, queueId);

        const updateTicket = new UpdateTicket(
            this.getParameterValue(parameter, TicketProperty.TITLE),
            this.getParameterValue(parameter, TicketProperty.CONTACT_ID),
            this.getParameterValue(parameter, TicketProperty.ORGANISATION_ID),
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
                token, clientRequestId, this.buildUri(this.RESOURCE_URI, objectId, 'articles'),
                new CreateArticleRequest(createArticle), this.objectType
            ).catch((error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return response.TicketID;
    }

    private async prepareArticleData(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, queueId: number, contactId?: number
    ): Promise<CreateArticle> {
        const attachments = this.createAttachments(this.getParameterValue(parameter, ArticleProperty.ATTACHMENTS));

        let senderType = this.getParameterValue(parameter, ArticleProperty.SENDER_TYPE_ID);
        if (!senderType) {
            senderType = 1;
        }

        let from = this.getParameterValue(parameter, ArticleProperty.FROM);
        if (!from) {
            const user = await UserService.getInstance().getUserByToken(token);
            from = user.UserEmail;
        }

        const channelId = this.getParameterValue(parameter, ArticleProperty.CHANNEL_ID);
        const subject = this.getParameterValue(parameter, ArticleProperty.SUBJECT);
        const body = this.getParameterValue(parameter, ArticleProperty.BODY);
        const customerVisible = this.getParameterValue(parameter, ArticleProperty.CUSTOMER_VISIBLE);
        let to = this.getParameterValue(parameter, ArticleProperty.TO);
        if (!to && contactId) {
            if (!isNaN(contactId)) {
                const contacts = await super.load<Contact>(
                    token, KIXObjectType.CONTACT, 'contacts', null, [contactId], 'Contact'
                );
                if (contacts && contacts.length) {
                    to = contacts[0].Email;
                }
            } else {
                to = contactId;
            }
        }
        const cc = this.getParameterValue(parameter, ArticleProperty.CC);
        const bcc = this.getParameterValue(parameter, ArticleProperty.BCC);

        let createArticle: CreateArticle;
        if (channelId && subject && body) {
            createArticle = new CreateArticle(
                subject, body, 'text/html; charset=utf8', 'text/html', 'utf8',
                channelId, senderType, null, from, null, null, null, null, null, null, null, null,
                attachments.length ? attachments : null,
                customerVisible !== undefined ? customerVisible : false,
                to, cc, bcc,
                this.getParameterValue(parameter, ArticleProperty.REFERENCED_ARTICLE_ID),
                this.getParameterValue(parameter, ArticleProperty.EXEC_REPLY),
                this.getParameterValue(parameter, ArticleProperty.EXEC_FORWARD)
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
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', attachmentId
        );

        const response = await this.getObjectByUri<ArticleAttachmentResponse>(token, uri, {
            include: 'Content'
        });
        return response.Attachment;
    }

    public async loadArticleZipAttachment(token: string, ticketId: number, articleId: number): Promise<Attachment> {
        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', 'zip'
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

        const baseUri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId);
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [ArticleProperty.FLAGS], [ArticleProperty.FLAGS]
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
        const uri = this.buildUri('watchers');
        const createWatcher = new CreateWatcher(userId, "Ticket", ticketId);
        const response = await this.sendCreateRequest<CreateWatcherResponse, CreateWatcherRequest>(
            token, clientRequestId, uri, new CreateWatcherRequest(createWatcher), this.objectType
        ).catch((error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });
        return response.WatcherID;
    }

    public async removeWatcher(
        token: string, clientRequestId: string, watcherId: number
    ): Promise<Error[]> {
        const uri = this.buildUri('watchers', watcherId);
        return await this.sendDeleteRequest<void>(token, clientRequestId, [uri], this.objectType);
    }

    // Overwrites from KIXObjectService
    // FIXME: unterschiedliche Behandlung von Filter und Search entfernen, sollte nicht notwendig sein
    protected async buildFilter(
        filter: FilterCriteria[], filterProperty: string, query: any, token?: string
    ): Promise<void> {
        let objectFilter = {};
        let objectSearch = {};

        const user = await UserService.getInstance().getUserByToken(token);
        const fulltextIndex = filter.findIndex((f) => f.property === TicketProperty.FULLTEXT);
        const fulltext = fulltextIndex !== -1 ? filter.splice(fulltextIndex, 1) : null;

        const andFilter = filter.filter(
            (f) => f.filterType === FilterType.AND
                && f.property !== TicketProperty.STATE_TYPE
                && f.property !== TicketProperty.CREATED
                && f.property !== KIXObjectProperty.CREATE_TIME
                && f.property !== TicketProperty.CHANGED
                && f.property !== KIXObjectProperty.CHANGE_TIME
        ).map((f) => {
            this.setUserID(f, user);
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });
        const andSearch = filter.filter(
            (f) => f.filterType === FilterType.AND && f.operator !== SearchOperator.NOT_EQUALS
        ).map((f) => {
            this.setUserID(f, user);
            if (f.property === TicketProperty.CREATED) {
                f.property = KIXObjectProperty.CREATE_TIME;
            }
            if (f.property === TicketProperty.CHANGED) {
                f.property = KIXObjectProperty.CHANGE_TIME;
            }
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
            (f) => f.filterType === FilterType.OR
                && f.property !== TicketProperty.STATE_TYPE
                && f.property !== TicketProperty.CREATED
                && f.property !== KIXObjectProperty.CREATE_TIME
                && f.property !== TicketProperty.CHANGED
                && f.property !== KIXObjectProperty.CHANGE_TIME
        ).map((f) => {
            this.setUserID(f, user);
            return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
        });
        let orSearch = filter.filter((f) => f.filterType === FilterType.OR && f.operator !== SearchOperator.NOT_EQUALS)
            .map((f) => {
                this.setUserID(f, user);
                if (f.property === TicketProperty.CREATED) {
                    f.property = KIXObjectProperty.CREATE_TIME;
                }
                if (f.property === TicketProperty.CHANGED) {
                    f.property = KIXObjectProperty.CHANGE_TIME;
                }
                return { Field: f.property, Operator: f.operator, Type: f.type, Value: f.value };
            });

        if (fulltext) {
            const fulltextSearch = this.getFulltextSearch(fulltext[0]);
            orSearch = [...orSearch, ...fulltextSearch];
        }

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

        if ((andFilter && !!andFilter.length) || (orFilter && !!orFilter.length)) {
            const apiFilter = {};
            apiFilter[filterProperty] = objectFilter;
            query.filter = JSON.stringify(apiFilter);
        }
        if ((andSearch && !!andSearch.length) || (orSearch && !!orSearch.length)) {
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

    private getFulltextSearch(fulltextFilter: FilterCriteria): any[] {
        return [
            {
                Field: TicketProperty.TICKET_NUMBER, Operator: SearchOperator.CONTAINS,
                Type: FilterDataType.STRING, Value: fulltextFilter.value
            },
            {
                Field: TicketProperty.TITLE, Operator: SearchOperator.CONTAINS,
                Type: FilterDataType.STRING, Value: fulltextFilter.value
            },
            {
                Field: TicketProperty.BODY, Operator: SearchOperator.CONTAINS,
                Type: FilterDataType.STRING, Value: fulltextFilter.value
            },
            {
                Field: TicketProperty.FROM, Operator: SearchOperator.CONTAINS,
                Type: FilterDataType.STRING, Value: fulltextFilter.value
            },
            {
                Field: TicketProperty.TO, Operator: SearchOperator.CONTAINS,
                Type: FilterDataType.STRING, Value: fulltextFilter.value
            },
            {
                Field: TicketProperty.CC, Operator: SearchOperator.CONTAINS,
                Type: FilterDataType.STRING, Value: fulltextFilter.value
            }
        ];
    }
}
