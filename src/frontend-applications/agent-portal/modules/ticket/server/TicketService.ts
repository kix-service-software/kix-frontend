/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectAPIService } from '../../../server/services/KIXObjectAPIService';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { KIXObjectServiceRegistry } from '../../../server/services/KIXObjectServiceRegistry';
import { KIXObjectLoadingOptions } from '../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../model/KIXObjectSpecificLoadingOptions';
import { TicketProperty } from '../model/TicketProperty';
import { LoggingService } from '../../../../../server/services/LoggingService';
import { KIXObjectSpecificDeleteOptions } from '../../../model/KIXObjectSpecificDeleteOptions';
import { ArticleProperty } from '../model/ArticleProperty';
import { UserService } from '../../user/server/UserService';
import { Attachment } from '../../../model/kix/Attachment';
import { Article } from '../model/Article';
import { FilterCriteria } from '../../../model/FilterCriteria';
import { KIXObjectProperty } from '../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../search/model/SearchOperator';
import { FilterDataType } from '../../../model/FilterDataType';
import { ArticleLoadingOptions } from '../model/ArticleLoadingOptions';
import { Error } from '../../../../../server/model/Error';
import { SearchProperty } from '../../search/model/SearchProperty';
import { FilterType } from '../../../model/FilterType';
import { Ticket } from '../model/Ticket';
import { SenderType } from '../model/SenderType';
import { TicketLock } from '../model/TicketLock';
import { CacheService } from '../../../server/services/cache';
import { PersonalSettingsProperty } from '../../user/model/PersonalSettingsProperty';
import { Contact } from '../../customer/model/Contact';
import { TicketHistory } from '../model/TicketHistory';
import { RequestObject } from '../../../../../server/model/rest/RequestObject';
import { KIXObjectSpecificCreateOptions } from '../../../model/KIXObjectSpecificCreateOptions';
import { CreateTicketWatcherOptions } from '../model/CreateTicketWatcherOptions';
import { KIXObject } from '../../../model/kix/KIXObject';

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
        super();
        KIXObjectServiceRegistry.registerServiceInstance(this);

        CacheService.getInstance().addDependencies(
            PersonalSettingsProperty.USER_LANGUAGE, [KIXObjectType.TICKET]
        );
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.TICKET
            || kixObjectType === KIXObjectType.ARTICLE
            || kixObjectType === KIXObjectType.SENDER_TYPE
            || kixObjectType === KIXObjectType.TICKET_LOCK
            || kixObjectType === KIXObjectType.WATCHER
            || kixObjectType === KIXObjectType.TICKET_HISTORY;
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<T[]> {

        let objects = [];
        if (objectType === KIXObjectType.TICKET) {

            const includes = [TicketProperty.STATE_TYPE, KIXObjectType.CONTACT, KIXObjectProperty.DYNAMIC_FIELDS];
            const expands = [];

            if (!loadingOptions) {
                loadingOptions = new KIXObjectLoadingOptions(null, null, null, includes, expands);
            } else {
                if (loadingOptions.includes) {
                    loadingOptions.includes = [...loadingOptions.includes, ...includes];
                }
                else {
                    loadingOptions.includes = includes;
                }

                if (loadingOptions.expands) {
                    loadingOptions.expands = [...loadingOptions.expands, ...expands];
                } else {
                    loadingOptions.expands = expands;
                }
            }

            objects = await super.load(
                token, KIXObjectType.TICKET, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.TICKET,
                clientRequestId, Ticket
            );
        } else if (objectType === KIXObjectType.SENDER_TYPE) {
            const uri = this.buildUri('system', 'communication', 'sendertypes');
            objects = await super.load(
                token, KIXObjectType.SENDER_TYPE, uri, null, null, 'SenderType', clientRequestId, SenderType
            );

            if (Array.isArray(objectIds) && objectIds.length) {
                objects = objects.filter((o) => objectIds.some((oid) => oid === o.ID));
            }
        } else if (objectType === KIXObjectType.TICKET_LOCK) {
            const uri = this.buildUri('system', 'ticket', 'locks');
            objects = await super.load(
                token, KIXObjectType.TICKET_LOCK, uri, null, null, 'Lock', clientRequestId, TicketLock
            );
        } else if (objectType === KIXObjectType.ARTICLE) {
            if (objectLoadingOptions) {
                if (!(objectLoadingOptions as ArticleLoadingOptions).ticketId) {
                    LoggingService.getInstance().error('Need ticketId to load articles');
                    throw new Error('', 'Need ticketId to load articles');
                }
                const uri = this.buildUri(
                    this.RESOURCE_URI, (objectLoadingOptions as ArticleLoadingOptions).ticketId, 'articles'
                );
                objects = await super.load(
                    token, KIXObjectType.ARTICLE, uri, loadingOptions, objectIds, 'Article',
                    clientRequestId, Article
                );
            }
        } else if (objectType === KIXObjectType.TICKET_HISTORY) {
            if (objectIds?.length) {
                const uri = this.buildUri(
                    this.RESOURCE_URI, objectIds[0], 'history'
                );
                objects = await super.load(
                    token, KIXObjectType.TICKET_HISTORY, uri, loadingOptions, null, 'History',
                    clientRequestId, TicketHistory
                );
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
                token, null, parameter, queueId, contactId
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
                token, clientRequestId, ticketId, this.getParameterValue(ticketParameter, KIXObjectProperty.LINKS)
            );

            return ticketId;
        } else if (objectType === KIXObjectType.WATCHER) {
            const watcherOptions = createOptions as CreateTicketWatcherOptions;
            return this.addWatcher(token, clientRequestId, watcherOptions.ticketId, watcherOptions.userId);
        }
    }

    private async prepareArticleData(
        token: string, ticketId: number, parameter: Array<[string, any]>, queueId: number, contactId?: number
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
                    const contacts = await super.load<Contact>(
                        token, KIXObjectType.CONTACT, 'contacts', null, [contactId], 'Contact',
                        'TicketService', Contact
                    );
                    if (contacts && contacts.length) {
                        to = contacts[0].Email;
                    }
                } else {
                    to = contactId;
                }

                // switch To and From with external sendertype by channel note on new ticket (= incomming call)
                // - so ticket "is" from customer
                if (!ticketId && channelId === 1) {
                    const oldFrom = from;
                    from = to;
                    to = oldFrom;
                    senderType = 3;
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
            articleParameter.push(
                [ArticleProperty.IN_REPLY_TO, this.getParameterValue(parameter, ArticleProperty.IN_REPLY_TO)]
            );
            articleParameter.push(
                [ArticleProperty.CUSTOMER_VISIBLE, this.getParameterValue(parameter, ArticleProperty.CUSTOMER_VISIBLE)]
            );

            const attachments = await this.createAttachments(
                token, this.getParameterValue(parameter, ArticleProperty.ATTACHMENTS), ticketId
            );
            articleParameter.push(
                [ArticleProperty.ATTACHMENTS, attachments.length ? attachments : null]
            );

            articleParameter.push([
                ArticleProperty.REFERENCED_ARTICLE_ID,
                this.getParameterValue(parameter, ArticleProperty.REFERENCED_ARTICLE_ID)
            ]);

            articleParameter.push([ArticleProperty.CONTENT_TYPE, 'text/html; charset=utf-8']);
            articleParameter.push([ArticleProperty.MIME_TYPE, 'text/html']);
            articleParameter.push([ArticleProperty.CHARSET, 'utf-8']);

            for (const service of this.extendedServices) {
                service.postPrepareParameter(parameter, articleParameter);
            }
        }
        return articleParameter;
    }

    private async createAttachments(
        token: string, attachments: Attachment[], ticketId: number
    ): Promise<RequestObject[]> {
        const result = [];
        if (Array.isArray(attachments)) {
            const newAttachments = [
                ...attachments.filter((a) => a.Content)
            ];

            if (ticketId) {
                const referencedAttachments = attachments.filter(
                    (a) => (!a.Content || a.Content === '') && a['ReferencedArticleId']
                );
                for (const a of referencedAttachments) {
                    const uri = this.buildUri(
                        'tickets', ticketId, 'articles', a['ReferencedArticleId'], 'attachments', a.ID
                    );

                    const referedAttachments = await super.load<Attachment>(
                        token, KIXObjectType.ATTACHMENT, uri,
                        new KIXObjectLoadingOptions(null, null, null, ['Content']), null, 'Attachment',
                        'TicketService'
                    );

                    newAttachments.push(referedAttachments[0]);
                }
            }

            newAttachments.forEach(
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

    public async updateObject(
        token: string, clientRequestId: string, objectType: KIXObjectType,
        parameter: Array<[string, any]>, objectId: number
    ): Promise<string | number> {

        if (parameter.length) {
            const uri = this.buildUri(this.RESOURCE_URI, objectId);
            await super.executeUpdateOrCreateRequest<number>(
                token, clientRequestId, parameter, uri, this.objectType, 'TicketID'
            ).catch((error: Error) => {
                LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                throw new Error(error.Code, error.Message);
            });
        }

        return objectId;
    }

    public async commitObject(token: string, clientRequestId: string, ticket: Ticket): Promise<number | string> {

        const content = { Ticket: ticket };
        const create = !(ticket.TicketID > 0);

        let uri = this.RESOURCE_URI;
        let articles: Article[];

        if (ticket.Articles?.length) {
            const articlePromises = [];
            for (const article of ticket.Articles) {
                articlePromises.push(this.prepareArticle(token, ticket, article));
            }

            await Promise.all(articlePromises);
        }

        if (!create) {
            uri = this.buildUri(this.RESOURCE_URI, ticket?.TicketID);
            articles = ticket.Articles;
            delete ticket.Articles;
        }

        if (!Array.isArray(ticket.DynamicFields) || !ticket.DynamicFields.length) {
            delete ticket.DynamicFields;
        }

        const response = await this.sendRequest(
            token, clientRequestId, uri, content, KIXObjectType.TICKET, create
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        if (!create && articles?.length && ticket.TicketID) {
            for (const article of articles) {
                if (!article.ArticleID) {
                    const uri = this.buildUri(this.RESOURCE_URI, ticket.TicketID, 'articles');
                    await this.sendRequest(
                        token, clientRequestId, uri, { Article: article }, KIXObjectType.ARTICLE, true
                    ).catch((error: Error) => {
                        LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                        // TODO: exetend error handling if more than one article will be created?
                        throw new Error(error.Code, error.Message);
                    });
                }
            }
        }

        return response[TicketProperty.TICKET_ID];
    }

    private async prepareArticle(token: string, ticket: Ticket, article: Article): Promise<void> {
        if (!article.From) {
            const user = await UserService.getInstance().getUserByToken(token);
            if (user.Contact) {
                article.From = user.Contact.Email;
                if (!article.From.match(/.+\s<.+>/)) {
                    article.From = `"${user.Contact.Firstname} ${user.Contact.Lastname}" <${article.From}>`;
                }
            }
        }

        if (!article.SenderTypeID) {
            article.SenderTypeID = 1;
        }

        if (!article.To && ticket.ContactID && article.SenderTypeID !== 3) {
            const contacts = await super.load<Contact>(
                token, KIXObjectType.CONTACT, 'contacts', null, [ticket.ContactID], 'Contact', 'prepareArticle',
                Contact
            );
            if (contacts && contacts.length) {
                article.To = contacts[0].Email;
                if (!article.To.match(/.+\s<.+>/)) {
                    article.To = `"${contacts[0].Firstname} ${contacts[0].Lastname}" <${article.To}>`;
                }
            }

            // new/unkown contact
            else {
                article.To = ticket.ContactID.toString();
            }

            // switch To and From with external sendertype by channel note on new ticket (= incomming call)
            // - so ticket "is" from customer
            if (!ticket.TicketID && article.ChannelID === 1) {
                const oldFrom = article.From;
                article.From = article.To;
                article.To = oldFrom;
                article.SenderTypeID = 3;
            }
        }

        article.ContentType = 'text/html; charset=utf8';
        article.MimeType = 'text/html';
        article.Charset = 'utf8';
    }

    public async deleteObject(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectId: number,
        deleteOptions: KIXObjectSpecificDeleteOptions
    ): Promise<Error[]> {
        if (objectType === KIXObjectType.WATCHER) {
            return this.removeWatcher(token, clientRequestId, objectId);
        }
    }

    public async loadArticleAttachment(
        token: string, ticketId: number, articleId: number, attachmentId: number
    ): Promise<Attachment> {

        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', attachmentId
        );

        const response = await this.getObjectByUri(token, uri, 'TicketService', {
            include: 'Content'
        });
        return response['Attachment'];
    }

    public async loadArticleZipAttachment(token: string, ticketId: number, articleId: number): Promise<Attachment> {
        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', 'zip'
        );

        const response = await this.getObjectByUri(token, uri, 'TicketService', {
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
            token, KIXObjectType.ARTICLE, baseUri, loadingOptions, null, 'Article',
            clientRequestId, Article
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

    public async prepareAPIFilter(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        const filterProperties = [
            TicketProperty.STATE,
            KIXObjectProperty.CREATE_BY,
            KIXObjectProperty.CHANGE_BY,
            'Queue.FollowUpID'
        ];

        const filterCriteria = criteria.filter((f) => {
            const isFilterProperty = filterProperties.some((fp) => f.property === fp);
            const isTicketId = (f.property === TicketProperty.TICKET_ID && f.operator === SearchOperator.NOT_EQUALS);
            return isFilterProperty || isTicketId;
        });
        await this.setUserID(filterCriteria, token);
        return filterCriteria;
    }

    public async prepareAPISearch(criteria: FilterCriteria[], token: string): Promise<FilterCriteria[]> {
        let searchCriteria = criteria.filter((f) =>
            Ticket.SEARCH_PROPERTIES.some((sp) => sp.Property === f.property)
            && f.operator !== SearchOperator.NOT_EQUALS
        );

        await this.setUserID(searchCriteria, token);

        const primary = criteria.find((f) => f.property === SearchProperty.PRIMARY);
        if (primary) {
            const primarySearch = [
                new FilterCriteria(
                    TicketProperty.TICKET_NUMBER, SearchOperator.LIKE,
                    FilterDataType.STRING, FilterType.OR, `${primary.value}`
                ),
            ];
            searchCriteria = [...searchCriteria, ...primarySearch];
        }

        const fulltext = criteria.find((f) => f.property === SearchProperty.FULLTEXT);
        if (fulltext) {
            const fulltextSearch = this.getFulltextSearch(fulltext);
            searchCriteria = [...searchCriteria, ...fulltextSearch];
        }

        const createdCriteria = searchCriteria.find((sc) => sc.property === TicketProperty.CREATED);
        if (createdCriteria) {
            createdCriteria.property = KIXObjectProperty.CREATE_TIME;
        }

        const changedCriteria = searchCriteria.find((sc) => sc.property === TicketProperty.CHANGED);
        if (changedCriteria) {
            changedCriteria.property = KIXObjectProperty.CHANGE_TIME;
        }

        const visibleCriteria = searchCriteria.find((sc) => sc.property === ArticleProperty.CUSTOMER_VISIBLE);
        if (
            visibleCriteria
            && Array.isArray(visibleCriteria.value)
            && visibleCriteria.operator === SearchOperator.EQUALS
        ) {
            visibleCriteria.value = visibleCriteria.value[0];
        }

        const lockCriteria = searchCriteria.find((sc) => sc.property === TicketProperty.LOCK_ID);
        if (
            lockCriteria
            && Array.isArray(lockCriteria.value)
            && lockCriteria.operator === SearchOperator.EQUALS
        ) {
            lockCriteria.value = lockCriteria.value[0];
        }

        const hasStateSearch = searchCriteria.some((c) =>
            c.property === TicketProperty.STATE_ID ||
            c.property === TicketProperty.STATE_TYPE ||
            c.property === TicketProperty.STATE_TYPE_ID
        );

        const hasTicketSearch = searchCriteria.some((c) =>
            c.property === TicketProperty.TICKET_NUMBER ||
            c.property === TicketProperty.TICKET_ID
        );

        if (!hasStateSearch && !hasTicketSearch) {
            searchCriteria.push(
                new FilterCriteria(
                    TicketProperty.STATE_TYPE, SearchOperator.IN,
                    FilterDataType.STRING, FilterType.AND, ['Open']
                )
            );
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
                ArticleProperty.SUBJECT, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                ArticleProperty.BODY, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                ArticleProperty.FROM, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                ArticleProperty.TO, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            ),
            new FilterCriteria(
                ArticleProperty.CC, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${fulltextFilter.value}*`
            )
        ];
    }

    protected getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        let objectClass;

        if (objectType === KIXObjectType.SENDER_TYPE) {
            objectClass = SenderType;
        }
        return objectClass;
    }

}
