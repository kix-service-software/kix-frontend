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
import { CreateTicketWatcherOptions } from "../model/CreateTicketWatcherOptions";
import { Error } from "../../../../../server/model/Error";
import { SenderTypeFactory } from "./SenderTypeFactory";
import { ArticleFactory } from "./ArticleFactory";
import { LockFactory } from "./LockFactory";
import { SearchProperty } from "../../search/model/SearchProperty";
import { FilterType } from "../../../model/FilterType";
import { Ticket } from "../model/Ticket";
import { RequestObject } from "../../../../../server/model/rest/RequestObject";

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

            const orgParameter = parameter.find((p) => p[0] === TicketProperty.ORGANISATION_ID);
            if (orgParameter && isNaN(orgParameter[1])) {
                orgParameter[1] = null;
            }

            const articleParameter = await this.prepareArticleData(
                token, clientRequestId, parameter, queueId, contactId
            );

            const ticketParameter = articleParameter ? parameter.filter(
                (p) => !articleParameter.some((ap) => ap[0] === p[0])
            ) : parameter;
            ticketParameter.push(
                [TicketProperty.ARTICLES, articleParameter ? [new RequestObject(articleParameter)] : null]
            );

            const ticketId = await super.executeUpdateOrCreateRequest<number>(
                token, clientRequestId, ticketParameter, this.RESOURCE_URI, KIXObjectType.TICKET, 'TicketID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });

            await this.createLinks(
                token, clientRequestId, ticketId, this.getParameterValue(ticketParameter, TicketProperty.LINK)
            );

            return ticketId;
        } else if (objectType === KIXObjectType.ARTICLE) {
            const options = createOptions as CreateTicketArticleOptions;

            let queueId;
            const tickets = await super.load<Ticket>(
                token, KIXObjectType.TICKET, this.RESOURCE_URI, null, [options.ticketId], KIXObjectType.TICKET
            );
            if (tickets && tickets.length) {
                queueId = tickets[0].QueueID;
            }

            const articleParameter = await this.prepareArticleData(token, clientRequestId, parameter, queueId);
            if (articleParameter) {
                const articleUri = this.buildUri(this.RESOURCE_URI, tickets[0].TicketID, 'articles');
                const articleId = await super.executeUpdateOrCreateRequest<number>(
                    token, clientRequestId, articleParameter, articleUri, KIXObjectType.ARTICLE, 'ArticleID', true
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    throw new Error(error.Code, error.Message);
                });

                return articleId;
            }
            return null;
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
        const articleParameter = await this.prepareArticleData(token, clientRequestId, parameter, queueId);

        const ticketParameter = articleParameter ? parameter.filter(
            (p) => !articleParameter.some((ap) => ap[0] === p[0])
        ) : parameter;

        const uri = this.buildUri(this.RESOURCE_URI, objectId);
        const ticketId = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, ticketParameter, uri, this.objectType, 'TicketID'
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        if (articleParameter) {
            const articleUri = this.buildUri(this.RESOURCE_URI, objectId, 'articles');
            await super.executeUpdateOrCreateRequest<number>(
                token, clientRequestId, articleParameter, articleUri, KIXObjectType.ARTICLE, 'ArticleID', true
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return ticketId;
    }

    private async prepareArticleData(
        token: string, clientRequestId: string, parameter: Array<[string, any]>, queueId: number, contactId?: number
    ): Promise<Array<[string, any]>> {

        const channelId = this.getParameterValue(parameter, ArticleProperty.CHANNEL_ID);
        const subject = this.getParameterValue(parameter, ArticleProperty.SUBJECT);
        const body = this.getParameterValue(parameter, ArticleProperty.BODY);

        let articleParameter: Array<[string, any]>;
        if (channelId && subject && body) {
            let from = this.getParameterValue(parameter, ArticleProperty.FROM);
            if (!from) {
                const user = await UserService.getInstance().getUserByToken(token);
                from = user.Contact ? user.Contact.Email : null;
            }

            let senderType = this.getParameterValue(parameter, ArticleProperty.SENDER_TYPE_ID);
            if (!senderType) {
                senderType = 1;
            }

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

            articleParameter = [];
            articleParameter.push([ArticleProperty.CHANNEL_ID, channelId]);
            articleParameter.push([ArticleProperty.SUBJECT, subject]);
            articleParameter.push([ArticleProperty.BODY, body]);
            articleParameter.push([ArticleProperty.SENDER_TYPE_ID, senderType]);
            articleParameter.push([ArticleProperty.FROM, from]);
            articleParameter.push([ArticleProperty.TO, to]);
            articleParameter.push([ArticleProperty.CC, this.getParameterValue(parameter, ArticleProperty.CC)]);
            articleParameter.push([ArticleProperty.BCC, this.getParameterValue(parameter, ArticleProperty.BCC)]);
            articleParameter.push([
                ArticleProperty.CUSTOMER_VISIBLE, this.getParameterValue(parameter, ArticleProperty.CUSTOMER_VISIBLE)]
            );

            const attachments = this.createAttachments(this.getParameterValue(parameter, ArticleProperty.ATTACHMENTS));
            articleParameter.push(
                [ArticleProperty.ATTACHMENTS, attachments.length ? attachments : null]
            );

            articleParameter.push([
                ArticleProperty.REFERENCED_ARTICLE_ID,
                this.getParameterValue(parameter, ArticleProperty.REFERENCED_ARTICLE_ID)
            ]);
            articleParameter.push([
                ArticleProperty.EXEC_REPLY, this.getParameterValue(parameter, ArticleProperty.EXEC_REPLY)
            ]);
            articleParameter.push([
                ArticleProperty.EXEC_FORWARD, this.getParameterValue(parameter, ArticleProperty.EXEC_FORWARD)
            ]);

            articleParameter.push([ArticleProperty.CONTENT_TYPE, 'text/html; charset=utf8']);
            articleParameter.push([ArticleProperty.MIME_TYPE, 'text/html']);
            articleParameter.push([ArticleProperty.CHARSET, 'utf8']);
        }
        return articleParameter;
    }

    private createAttachments(attachments: Attachment[]): RequestObject[] {
        const result = [];
        if (attachments) {
            attachments.forEach(
                (a) => result.push(
                    new RequestObject([
                        ['Content', a.Content],
                        ['ContentType', a.ContentType],
                        ['Filename', a.Filename]
                    ])
                )
            );
        }
        return result;
    }

    public async loadArticleAttachment(
        token: string, ticketId: number, articleId: number, attachmentId: number
    ): Promise<Attachment> {

        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', attachmentId
        );

        const response = await this.getObjectByUri(token, uri, {
            include: 'Content'
        });
        return response['Attachment'];
    }

    public async loadArticleZipAttachment(token: string, ticketId: number, articleId: number): Promise<Attachment> {
        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', 'zip'
        );

        const response = await this.getObjectByUri(token, uri, {
            include: 'Content'
        });
        return response['Attachment'];
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

        const parameter: Array<[string, any]> = [
            ['UserID', userId],
            ['Object', KIXObjectType.TICKET],
            ['ObjectID', ticketId]
        ];

        const watcherId = await super.executeUpdateOrCreateRequest<number>(
            token, clientRequestId, parameter, uri, KIXObjectType.WATCHER, 'WatcherID', true
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return watcherId;
    }

    public async removeWatcher(
        token: string, clientRequestId: string, watcherId: number
    ): Promise<Error[]> {
        const uri = this.buildUri('watchers', watcherId);
        return await this.sendDeleteRequest<void>(token, clientRequestId, [uri], this.objectType);
    }

    protected async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const filterProperties = [
            TicketProperty.TICKET_NUMBER,
            TicketProperty.TITLE,
            TicketProperty.PENDING_TIME,
            TicketProperty.ORGANISATION_ID,
            TicketProperty.CONTACT_ID,
            TicketProperty.TYPE_ID,
            TicketProperty.STATE_ID,
            TicketProperty.QUEUE_ID,
            TicketProperty.PRIORITY_ID,
            TicketProperty.LOCK_ID,
            TicketProperty.OWNER_ID,
            TicketProperty.RESPONSIBLE_ID,
            TicketProperty.STATE,
            KIXObjectProperty.CREATE_BY,
            KIXObjectProperty.CHANGE_BY,
            TicketProperty.TICKET_ID
        ];

        let filterCriteria = criteria.filter((f) => filterProperties.some((fp) => f.property === fp));

        const fulltext = criteria.find((f) => f.property === SearchProperty.FULLTEXT);

        if (fulltext) {
            const fulltextSearch = this.getFulltextSearch(fulltext);
            filterCriteria = [...filterCriteria, ...fulltextSearch];
        }

        await this.setUserID(filterCriteria, token);

        return filterCriteria;
    }

    protected async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const searchProperties = [
            TicketProperty.TICKET_NUMBER,
            TicketProperty.TITLE,
            TicketProperty.CREATED,
            TicketProperty.CLOSE_TIME,
            TicketProperty.CHANGED,
            TicketProperty.PENDING_TIME,
            TicketProperty.LAST_CHANGE_TIME,
            TicketProperty.ORGANISATION_ID,
            TicketProperty.CONTACT_ID,
            TicketProperty.TYPE_ID,
            TicketProperty.STATE_ID,
            TicketProperty.QUEUE_ID,
            TicketProperty.PRIORITY_ID,
            TicketProperty.LOCK_ID,
            TicketProperty.OWNER_ID,
            TicketProperty.RESPONSIBLE_ID,
            TicketProperty.STATE_TYPE
        ];

        const searchCriteria = criteria.filter(
            (f) => searchProperties.some((sp) => sp === f.property) && f.operator !== SearchOperator.NOT_EQUALS
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
