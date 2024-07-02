/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TicketTypeAPIService } from './TicketTypeService';
import { TicketStateAPIService } from './TicketStateService';
import { TicketPriorityAPIService } from './TicketPriorityService';
import { ChannelAPIService } from './ChannelService';
import { TextModuleAPIService } from '../../textmodule/server/TextModuleService';
import { QueueAPIService } from './QueueService';
import { DynamicFieldAPIService } from '../../dynamic-fields/server/DynamicFieldService';
import { SysConfigService } from '../../sysconfig/server/SysConfigService';
import { SysConfigKey } from '../../sysconfig/model/SysConfigKey';
import { UIComponentPermission } from '../../../model/UIComponentPermission';
import { CRUD } from '../../../../../server/model/rest/CRUD';
import { PermissionService } from '../../../server/services/PermissionService';
import { SysConfigOption } from '../../sysconfig/model/SysConfigOption';
import { ObjectResponse } from '../../../server/services/ObjectResponse';
import { ObjectSearchAPIService } from '../../object-search/server/ObjectSearchAPIService';
import { ObjectSearchLoadingOptions } from '../../object-search/model/ObjectSearchLoadingOptions';
import { Counter } from '../../user/model/Counter';
import { FileService } from '../../file/server/FileService';

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
            || kixObjectType === KIXObjectType.TICKET_HISTORY
            || kixObjectType === KIXObjectType.HTML_TO_PDF
            || kixObjectType === KIXObjectType.USER_TICKETS
            || kixObjectType === KIXObjectType.USER_COUNTER;
    }

    public async preloadObjects(token: string): Promise<void> {
        const promises = [];

        // check permissions for preloading
        const permissionPromises = [];
        const allowedList: Map<KIXObjectType, boolean> = new Map();
        [
            { permissions: [new UIComponentPermission('/system/ticket/types', [CRUD.READ])], type: KIXObjectType.TICKET_TYPE },
            { permissions: [new UIComponentPermission('/system/ticket/states', [CRUD.READ])], type: KIXObjectType.TICKET_STATE },
            { permissions: [new UIComponentPermission('/system/ticket/states/types', [CRUD.READ])], type: KIXObjectType.TICKET_STATE_TYPE },
            { permissions: [new UIComponentPermission('/system/ticket/priorities', [CRUD.READ])], type: KIXObjectType.TICKET_PRIORITY },
            { permissions: [new UIComponentPermission('/system/communication/channels', [CRUD.READ])], type: KIXObjectType.CHANNEL },
            { permissions: [new UIComponentPermission('/system/textmodules', [CRUD.READ])], type: KIXObjectType.TEXT_MODULE },
            { permissions: [new UIComponentPermission('/system/ticket/queues', [CRUD.READ])], type: KIXObjectType.QUEUE },
            { permissions: [new UIComponentPermission('/system/dynamicfields', [CRUD.READ])], type: KIXObjectType.DYNAMIC_FIELD },
            { permissions: [new UIComponentPermission('/system/config', [CRUD.READ])], type: KIXObjectType.SYS_CONFIG_OPTION },
            { permissions: [new UIComponentPermission('/objectsearch/ticket', [CRUD.READ])], type: KIXObjectType.OBJECT_SEARCH }
        ].forEach((cp) => {
            permissionPromises.push(
                new Promise(async (resolve) => {
                    const allowed = await PermissionService.getInstance().checkPermissions(
                        token, cp.permissions, 'TicketServicePreload'
                    ).catch(() => false);
                    if (allowed) {
                        allowedList.set(cp.type, true);
                    }
                    resolve(true);
                })
            );
        });

        await Promise.all(permissionPromises).catch(() => {
            // ignore fails, just go on
        });

        if (allowedList.has(KIXObjectType.TICKET_TYPE)) {
            promises.push(
                TicketTypeAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.TICKET_TYPE, null, null, null
                )
            );
        }
        if (allowedList.has(KIXObjectType.TICKET_STATE)) {
            promises.push(
                TicketStateAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.TICKET_STATE, null, null, null
                )
            );
        }
        if (allowedList.has(KIXObjectType.TICKET_STATE_TYPE)) {
            promises.push(
                TicketStateAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.TICKET_STATE_TYPE, null, null, null
                )
            );
        }
        if (allowedList.has(KIXObjectType.TICKET_PRIORITY)) {
            promises.push(
                TicketPriorityAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.TICKET_PRIORITY, null, null, null
                )
            );
        }
        if (allowedList.has(KIXObjectType.CHANNEL)) {
            promises.push(
                ChannelAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.CHANNEL, null, null, null
                )
            );
        }
        if (allowedList.has(KIXObjectType.TEXT_MODULE)) {
            promises.push(
                TextModuleAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.TEXT_MODULE, null, null, null
                )
            );
        }

        if (allowedList.has(KIXObjectType.QUEUE)) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = ['TicketStats'];
            loadingOptions.query = [['TicketStats.StateType', 'Open']];
            loadingOptions.cacheType = 'QUEUE_HIERARCHY';
            promises.push(
                QueueAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.QUEUE, null, loadingOptions, null
                )
            );
        }

        if (allowedList.has(KIXObjectType.DYNAMIC_FIELD)) {
            if (allowedList) {
                promises.push(DynamicFieldAPIService.getInstance().preloadObjects(token));
            }
        }

        if (allowedList.has(KIXObjectType.SYS_CONFIG_OPTION)) {
            promises.push(
                SysConfigService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.SYS_CONFIG_OPTION,
                    [SysConfigKey.TICKET_SEARCH_INDEX_STOPWORDS + '###en'], null, null
                )
            );
            promises.push(
                SysConfigService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.SYS_CONFIG_OPTION,
                    [SysConfigKey.TICKET_SEARCH_INDEX_STOPWORDS + '###de'], null, null
                )
            );
            promises.push(
                SysConfigService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.SYS_CONFIG_OPTION,
                    [SysConfigKey.CONFIG_ITEM_HOOK], null, null
                )
            );
            promises.push(
                SysConfigService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.SYS_CONFIG_OPTION,
                    [SysConfigKey.TICKET_HOOK], null, null
                )
            );
            promises.push(
                SysConfigService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.SYS_CONFIG_OPTION,
                    [SysConfigKey.TICKET_HOOK_DIVIDER], null, null
                )
            );
        }

        if (allowedList.has(KIXObjectType.OBJECT_SEARCH)) {
            promises.push(
                ObjectSearchAPIService.getInstance().loadObjects(
                    token, 'TicketServicePreload', KIXObjectType.OBJECT_SEARCH, null, null,
                    new ObjectSearchLoadingOptions(KIXObjectType.TICKET)
                )
            );
        }

        for (const extendedService of this.extendedServices) {
            promises.push(extendedService.preloadObjects(token));
        }

        await Promise.all(promises).catch(() => {
            // ignore fails, just go on
        });
    }

    public async loadObjects<T>(
        token: string, clientRequestId: string, objectType: KIXObjectType, objectIds: Array<number | string>,
        loadingOptions: KIXObjectLoadingOptions, objectLoadingOptions: KIXObjectSpecificLoadingOptions
    ): Promise<ObjectResponse<T>> {

        let objectResponse = new ObjectResponse([], 0);
        if (objectType === KIXObjectType.TICKET) {

            const includes = [TicketProperty.STATE_TYPE, TicketProperty.UNSEEN];
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

            if (!loadingOptions.query) {
                loadingOptions.query = [];
            }
            loadingOptions.query.push(['NoDynamicFieldDisplayValues', 'CheckList,ITSMConfigItemReference,TicketReference']);


            objectResponse = await super.load(
                token, KIXObjectType.TICKET, this.RESOURCE_URI, loadingOptions, objectIds, KIXObjectType.TICKET,
                clientRequestId, Ticket
            );
        } else if (objectType === KIXObjectType.USER_TICKETS) {
            const uri = this.buildUri('session', 'user', 'tickets');
            const user = await UserService.getInstance().getUserByToken(token);
            loadingOptions.cacheType = `${KIXObjectType.USER_TICKETS}_${user?.UserID}`;
            objectResponse = await super.load(
                token, KIXObjectType.TICKET, uri, loadingOptions, null, KIXObjectType.TICKET,
                clientRequestId, Ticket
            );
        } else if (objectType === KIXObjectType.USER_COUNTER) {
            const uri = this.buildUri('session', 'user', 'counters');
            const user = await UserService.getInstance().getUserByToken(token);
            loadingOptions.cacheType = `${KIXObjectType.USER_COUNTER}_${user?.UserID}`;
            objectResponse = await super.load(
                token, KIXObjectType.USER_COUNTER, uri, loadingOptions, null, 'Counter',
                clientRequestId, Counter
            );
        } else if (objectType === KIXObjectType.SENDER_TYPE) {
            const uri = this.buildUri('system', 'communication', 'sendertypes');
            objectResponse = await super.load(
                token, KIXObjectType.SENDER_TYPE, uri, null, null, 'SenderType', clientRequestId, SenderType
            );

            if (Array.isArray(objectIds) && objectIds.length) {
                objectResponse.objects = objectResponse?.objects.filter((o) => objectIds.some((oid) => oid === o.ID));
            }
        } else if (objectType === KIXObjectType.TICKET_LOCK) {
            const uri = this.buildUri('system', 'ticket', 'locks');
            objectResponse = await super.load(
                token, KIXObjectType.TICKET_LOCK, uri, null, null, 'Lock', clientRequestId, TicketLock
            );
        } else if (objectType === KIXObjectType.ARTICLE) {
            if (!(objectLoadingOptions as ArticleLoadingOptions)?.ticketId) {
                LoggingService.getInstance().error('Need ticketId to load articles');
                throw new Error('', 'Need ticketId to load articles');
            }
            const uri = this.buildUri(
                this.RESOURCE_URI, (objectLoadingOptions as ArticleLoadingOptions).ticketId, 'articles'
            );
            objectResponse = await super.load(
                token, KIXObjectType.ARTICLE, uri, loadingOptions, objectIds, 'Article',
                clientRequestId, Article
            );
        } else if (objectType === KIXObjectType.TICKET_HISTORY) {
            if (objectIds?.length) {
                const uri = this.buildUri(
                    this.RESOURCE_URI, objectIds[0], 'history'
                );
                // get unlimit/all history
                if (!loadingOptions) {
                    loadingOptions = new KIXObjectLoadingOptions(null, null, 0);
                } else if (!loadingOptions.limit) {
                    loadingOptions.limit = 0;
                }
                objectResponse = await super.load(
                    token, KIXObjectType.TICKET_HISTORY, uri, loadingOptions, null, 'History',
                    clientRequestId, TicketHistory
                );
            }
        }
        else if (objectType === KIXObjectType.HTML_TO_PDF) {
            const uri = this.buildUri('system', 'htmltopdf', 'convert');
            objectResponse = await super.load(
                token, KIXObjectType.HTML_TO_PDF, uri, loadingOptions, null, KIXObjectType.HTML_TO_PDF,
                null, null, false
            );
        }

        return objectResponse;
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

            let senderType = this.getParameterValue(parameter, ArticleProperty.SENDER_TYPE_ID);
            if (!senderType) {
                senderType = 1;
            }

            let from;
            let to = this.getParameterValue(parameter, ArticleProperty.TO);
            if (!to && contactId && senderType !== 3) {
                if (!isNaN(contactId)) {
                    const objectResponse = await super.load<Contact>(
                        token, KIXObjectType.CONTACT, 'contacts', null, [contactId], 'Contact',
                        'TicketService', Contact
                    );
                    const contacts = objectResponse?.objects;
                    if (contacts && contacts.length) {
                        to = contacts[0].Email;
                    }
                } else {
                    to = contactId;
                }

                // switch To and From with external sendertype by channel note on new ticket (= incomming call)
                // - so ticket "is" from customer to agent
                if (!ticketId && channelId === 1) {
                    from = to;
                    const user = await UserService.getInstance().getUserByToken(token);
                    to = user.Contact ? user.Contact.Email : '';
                    if (!to.match(/.+\s<.+>/) && user.Contact) {
                        to = `"${user.Contact.Firstname} ${user.Contact.Lastname}" <${to}>`;
                    }
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

    public async commitObject(
        token: string, clientRequestId: string, ticket: Ticket, relevantOrganisationId: number
    ): Promise<number | string> {

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

        if (!create && articles?.length && ticket.TicketID) {
            for (const article of articles) {
                let uri, articleCreate;
                if (!article.ArticleID) {
                    articleCreate = true;
                    uri = this.buildUri(this.RESOURCE_URI, ticket.TicketID, 'articles');
                }
                else {
                    articleCreate = false;
                    uri = this.buildUri(this.RESOURCE_URI, ticket.TicketID, 'articles', article.ArticleID);
                }

                await this.sendRequest(
                    token, clientRequestId, uri, { Article: article }, KIXObjectType.ARTICLE, articleCreate,
                    relevantOrganisationId
                ).catch((error: Error) => {
                    LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
                    // TODO: exetend error handling if more than one article will be created?
                    throw new Error(error.Code, error.Message);
                });
            }
        }

        const response = await this.sendRequest(
            token, clientRequestId, uri, content, KIXObjectType.TICKET, create, relevantOrganisationId
        ).catch((error: Error) => {
            LoggingService.getInstance().error(`${error.Code}: ${error.Message}`, error);
            throw new Error(error.Code, error.Message);
        });

        return response[TicketProperty.TICKET_ID];
    }

    private async prepareArticle(token: string, ticket: Ticket, article: Article): Promise<void> {
        if (!article.SenderTypeID) {
            article.SenderTypeID = 1;
        }

        if (!article.To && ticket.ContactID && article.SenderTypeID !== 3) {
            const objectResponse = await super.load<Contact>(
                token, KIXObjectType.CONTACT, 'contacts', null, [ticket.ContactID], 'Contact', 'prepareArticle',
                Contact
            );
            const contacts = objectResponse?.objects;
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
            if (!ticket.TicketID && Number(article.ChannelID) === 1) {
                article.From = article.To;
                const user = await UserService.getInstance().getUserByToken(token);
                article.To = user.Contact ? user.Contact.Email : '';
                if (!article.To.match(/.+\s<.+>/) && user.Contact) {
                    article.To = `"${user.Contact.Firstname} ${user.Contact.Lastname}" <${article.To}>`;
                }
                article.SenderTypeID = 3;
            }
        }

        article.ContentType = 'text/html; charset=utf-8';
        article.MimeType = 'text/html';
        article.Charset = 'utf-8';

        await this.prepareArticleAttachments(article, token);
    }

    private async prepareArticleAttachments(article: Article, token: string): Promise<void> {
        if (Array.isArray(article.Attachments)) {
            for (const attachment of article.Attachments) {
                if (!attachment.Content) {
                    const crypto = require('crypto');
                    const md5 = crypto.createHash('md5').update(token).digest('hex');
                    const filename = `${md5}-${attachment.Filename}`;
                    const content = FileService.getFileContent(filename, false);
                    attachment.Content = content;
                    FileService.removeFile(filename, false);
                }
            }
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

    public async loadArticleAttachments(
        token: string, ticketId: number, articleId: number, attachmentIds: number[],
        relevantOrganisationId?: number, asDownload?: boolean
    ): Promise<Attachment[]> {

        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', attachmentIds.join(',')
        );

        const response = await this.getObjectByUri<any>(token, uri, 'TicketService', {
            include: 'Content',
            RelevantOrganisationID: relevantOrganisationId
        }, KIXObjectType.ATTACHMENT);

        const user = await UserService.getInstance().getUserByToken(token);
        let attachments = attachmentIds?.length === 1
            ? [response?.responseData?.Attachment]
            : response?.responseData?.Attachment;


        if (asDownload && Array.isArray(attachments)) {
            const preparedAttachments = [];
            for (const a of attachments) {
                const preparedAttachment = new Attachment(a);
                preparedAttachments.push(preparedAttachment);
                FileService.prepareFileForDownload(user?.UserID, preparedAttachment);
            }
            attachments = preparedAttachments;
        }

        return attachments as Attachment[];
    }

    public async loadArticleZipAttachment(
        token: string, ticketId: number, articleId: number, relevantOrganisationId?: number
    ): Promise<Attachment> {
        const uri = this.buildUri(
            this.RESOURCE_URI, ticketId, 'articles', articleId, 'attachments', 'zip'
        );

        const response = await this.getObjectByUri<any>(token, uri, 'TicketService', {
            include: 'Content',
            RelevantOrganisationID: relevantOrganisationId
        });
        return response?.responseData?.Attachment;
    }

    public async setArticleSeenFlag(
        token: string, clientRequestId: string, ticketId: number, articleId: number
    ): Promise<void> {
        const seenFlag = 'Seen';

        const baseUri = this.buildUri(this.RESOURCE_URI, ticketId, 'articles', articleId);
        const loadingOptions = new KIXObjectLoadingOptions(
            null, null, null, [ArticleProperty.FLAGS], [ArticleProperty.FLAGS]
        );

        const objectResponse = await super.load<Article>(
            token, KIXObjectType.ARTICLE, baseUri, loadingOptions, null, 'Article',
            clientRequestId, Article
        );
        const articles = objectResponse?.objects;

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

    public async prepareAPISearch(
        criteria: FilterCriteria[], token: string, objectType?: string
    ): Promise<FilterCriteria[]> {
        let searchCriteria = criteria.filter((f) =>
            f.property !== SearchProperty.PRIMARY
            && (
                f.property !== SearchProperty.FULLTEXT
                || objectType !== this.objectType
            )
        );

        await this.setUserID(searchCriteria, token);

        const primary = criteria.filter((f) => f.property === SearchProperty.PRIMARY);
        if (primary?.length) {
            primary.forEach((c) => {
                const primarySearch = [
                    new FilterCriteria(
                        TicketProperty.TICKET_NUMBER, SearchOperator.LIKE,
                        FilterDataType.STRING, FilterType.OR, `${c.value}`
                    ),
                ];
                searchCriteria = [...searchCriteria, ...primarySearch];
            });
        }

        const fulltext = criteria.filter((f) => f.property === SearchProperty.FULLTEXT);
        if (fulltext?.length && objectType === KIXObjectType.TICKET) {
            fulltext.forEach((c) => {
                const fulltextSearch = this.getFulltextSearch(c);
                searchCriteria = [...searchCriteria, ...fulltextSearch];
            });
        }

        const createdCriteria = searchCriteria.filter((sc) => sc.property === TicketProperty.CREATED);
        if (createdCriteria?.length) {
            createdCriteria.forEach((c) => c.property = KIXObjectProperty.CREATE_TIME);
        }

        const changedCriteria = searchCriteria.filter((sc) => sc.property === TicketProperty.CHANGED);
        if (changedCriteria?.length) {
            changedCriteria.forEach((c) => c.property = KIXObjectProperty.CHANGE_TIME);
        }

        const visibleCriteria = searchCriteria.filter((sc) => sc.property === ArticleProperty.CUSTOMER_VISIBLE);
        if (visibleCriteria?.length) {
            visibleCriteria.forEach((c) => {
                if (Array.isArray(c.value) && c.operator === SearchOperator.EQUALS) {
                    c.value = c.value[0];
                }
            });
        }

        const lockCriteria = searchCriteria.filter((sc) => sc.property === TicketProperty.LOCK_ID);
        if (lockCriteria?.length) {
            lockCriteria.forEach((c) => {
                if (Array.isArray(c.value) && c.operator === SearchOperator.EQUALS) {
                    c.value = c.value[0];
                }
            });
        }

        const ticketNumberCriterion = searchCriteria.filter((c) => c.property === TicketProperty.TICKET_NUMBER);
        if (ticketNumberCriterion?.length) {
            // remove hook and divider if necessary
            const objectResponse = await SysConfigService.getInstance().loadObjects<SysConfigOption>(
                token, 'TicketService', KIXObjectType.SYS_CONFIG_OPTION,
                [SysConfigKey.TICKET_HOOK, SysConfigKey.TICKET_HOOK_DIVIDER], null, null
            );
            const options = objectResponse?.objects || [];
            if (options?.length) {
                ticketNumberCriterion.forEach((c) => {
                    options.forEach((o) => c.value = c.value?.toString()?.replace(o.Value, ''));
                });
            }
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

    public getObjectClass(objectType: KIXObjectType | string): new (object: KIXObject) => KIXObject {
        let objectClass;

        if (objectType === KIXObjectType.SENDER_TYPE) {
            objectClass = SenderType;
        }
        return objectClass;
    }

}
