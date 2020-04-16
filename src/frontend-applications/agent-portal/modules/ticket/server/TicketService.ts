/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from "../../../server/services/KIXObjectAPIService";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { TicketFactory } from "./TicketFactory";
import { KIXObjectServiceRegistry } from "../../../server/services/KIXObjectServiceRegistry";
import { KIXObjectLoadingOptions } from "../../../model/KIXObjectLoadingOptions";
import { KIXObjectSpecificLoadingOptions } from "../../../model/KIXObjectSpecificLoadingOptions";
import { TicketProperty } from "../model/TicketProperty";
import { KIXObjectSpecificCreateOptions } from "../../../model/KIXObjectSpecificCreateOptions";
import { LoggingService } from "../../../../../server/services/LoggingService";
import { KIXObjectSpecificDeleteOptions } from "../../../model/KIXObjectSpecificDeleteOptions";
import { ArticleProperty } from "../model/ArticleProperty";
import { UserService } from "../../user/server/UserService";
import { Attachment } from "../../../model/kix/Attachment";
import { Article } from "../model/Article";
import { FilterCriteria } from "../../../model/FilterCriteria";
import { KIXObjectProperty } from "../../../model/kix/KIXObjectProperty";
import { SearchOperator } from "../../search/model/SearchOperator";
import { FilterDataType } from "../../../model/FilterDataType";
import { CreateTicketArticleOptions } from "../model/CreateTicketArticleOptions";
import { ArticleLoadingOptions } from "../model/ArticleLoadingOptions";
import { CreateTicket } from "./api/CreateTicket";
import { CreateTicketResponse } from "./api/CreateTicketResponse";
import { CreateTicketRequest } from "./api/CreateTicketRequest";
import { CreateArticleResponse } from "./api/CreateArticleResponse";
import { CreateArticleRequest } from "./api/CreateArticleRequest";
import { CreateTicketWatcherOptions } from "../model/CreateTicketWatcherOptions";
import { UpdateTicket } from "./api/UpdateTicket";
import { UpdateTicketResponse } from "./api/UpdateTicketResponse";
import { UpdateTicketRequest } from "./api/UpdateTicketRequest";
import { CreateArticle } from "./api/CreateArticle";
import { CreateAttachment } from "./api/CreateAttachment";
import { ArticleAttachmentResponse } from "./api/ArticleAttachmentResponse";
import { Error } from "../../../../../server/model/Error";
import { CreateWatcher } from "./api/CreateWatcher";
import { CreateWatcherResponse } from "./api/CreateWatcherResponse";
import { CreateWatcherRequest } from "./api/CreateWatcherRequest";
import { SenderTypeFactory } from "./SenderTypeFactory";
import { ArticleFactory } from "./ArticleFactory";
import { LockFactory } from "./LockFactory";
import { SearchProperty } from "../../search/model/SearchProperty";
import { FilterType } from "../../../model/FilterType";

export class TicketAPIService extends KIXObjectAPIService {

    private static INSTANCE: TicketAPIService;

    public static getInstance(): TicketAPIService {
        if (!TicketAPIService.INSTANCE) {
            TicketAPIService.INSTANCE = new TicketAPIService();
        }
        return TicketAPIService.INSTANCE;
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

            let organisationId = this.getParameterValue(parameter, TicketProperty.ORGANISATION_ID);
            if (isNaN(organisationId)) {
                organisationId = null;
            }

            const createArticle = await this.prepareArticleData(token, clientRequestId, parameter, queueId, contactId);

            const createTicket = new CreateTicket(
                this.getParameterValue(parameter, TicketProperty.TITLE),
                this.getParameterValue(parameter, TicketProperty.CONTACT_ID),
                organisationId,
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
                [createArticle],
                this.getParameterValue(parameter, KIXObjectProperty.DYNAMIC_FIELDS)
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
            this.getParameterValue(parameter, KIXObjectProperty.DYNAMIC_FIELDS),
            this.getParameterValue(parameter, TicketProperty.STATE)
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
            from = user.Contact ? user.Contact.Email : null;
        }

        const channelId = this.getParameterValue(parameter, ArticleProperty.CHANNEL_ID);
        const subject = this.getParameterValue(parameter, ArticleProperty.SUBJECT);
        const body = this.getParameterValue(parameter, ArticleProperty.BODY);
        const customerVisible = this.getParameterValue(parameter, ArticleProperty.CUSTOMER_VISIBLE);
        let to = this.getParameterValue(parameter, ArticleProperty.TO);
        if (!to && contactId && senderType !== 3) {
            if (!isNaN(contactId)) {
                const contacts = await super.load(
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
                channelId, senderType, null, from, null, null, null, null, null, null, null,
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

    protected async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        let filterCriteria = criteria.filter(
            (f) => f.property !== TicketProperty.STATE_TYPE
                && f.property !== TicketProperty.CREATED
                && f.property !== KIXObjectProperty.CREATE_TIME
                && f.property !== TicketProperty.CHANGED
                && f.property !== TicketProperty.CLOSE_TIME
                && f.property !== TicketProperty.LAST_CHANGE_TIME
                && f.property !== KIXObjectProperty.CHANGE_TIME
                && f.property !== SearchProperty.FULLTEXT
        );

        const fulltext = criteria.find((f) => f.property === SearchProperty.FULLTEXT);

        if (fulltext) {
            const fulltextSearch = this.getFulltextSearch(fulltext);
            filterCriteria = [...filterCriteria, ...fulltextSearch];
        }

        await this.setUserID(filterCriteria, token);

        return filterCriteria;
    }

    protected async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const searchCriteria = criteria.filter(
            (f) => f.operator !== SearchOperator.NOT_EQUALS
                && f.property !== KIXObjectProperty.CREATE_BY
                && f.property !== KIXObjectProperty.CHANGE_BY
                && f.property !== TicketProperty.STATE
                && f.property !== SearchProperty.FULLTEXT
        );

        await this.setUserID(searchCriteria, token);

        const createdCriteria = searchCriteria.find((sc) => sc.property === TicketProperty.CREATED);
        if (createdCriteria) {
            createdCriteria.property = KIXObjectProperty.CREATE_TIME;
        }

        const changedCriteria = searchCriteria.find((sc) => sc.property === TicketProperty.CHANGED);
        if (changedCriteria) {
            changedCriteria.property = KIXObjectProperty.CHANGE_TIME;
        }

        return searchCriteria;
    }

    private async setUserID(criteria: FilterCriteria[], token: string): Promise<void> {
        const user = await UserService.getInstance().getUserByToken(token);
        const ownerCriteria = criteria.find(
            (c) => c.property === TicketProperty.OWNER_ID && c.value === KIXObjectType.CURRENT_USER
        );

        if (ownerCriteria) {
            ownerCriteria.value = user.UserID;
        }

        const responsibleCriteria = criteria.find(
            (c) => c.property === TicketProperty.RESPONSIBLE_ID && c.value === KIXObjectType.CURRENT_USER
        );

        if (responsibleCriteria) {
            responsibleCriteria.value = user.UserID;
        }
    }

    private getFulltextSearch(fulltextFilter: FilterCriteria): FilterCriteria[] {
        return [
            new FilterCriteria(
                TicketProperty.TICKET_NUMBER, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                TicketProperty.TITLE, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                TicketProperty.BODY, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                TicketProperty.FROM, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                TicketProperty.TO, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                TicketProperty.CC, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            )
        ];
    }
}
