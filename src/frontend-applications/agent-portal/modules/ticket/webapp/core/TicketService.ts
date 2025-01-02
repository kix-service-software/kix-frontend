/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { Ticket } from '../../model/Ticket';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { ArticleProperty } from '../../model/ArticleProperty';
import { TicketProperty } from '../../model/TicketProperty';
import { Attachment } from '../../../../model/kix/Attachment';
import { TicketSocketClient } from './TicketSocketClient';
import { QueueService, } from './admin/QueueService';
import { TicketDetailsContext } from './context/TicketDetailsContext';
import { FilterCriteria } from '../../../../model/FilterCriteria';
import { SearchProperty } from '../../../search/model/SearchProperty';
import { SearchOperator } from '../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../model/FilterDataType';
import { FilterType } from '../../../../model/FilterType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { TicketType } from '../../model/TicketType';
import { TicketPriority } from '../../model/TicketPriority';
import { TicketState } from '../../model/TicketState';
import { User } from '../../../user/model/User';
import { UIFilterCriterion } from '../../../../model/UIFilterCriterion';
import { StateType } from '../../model/StateType';
import { ContextService } from '../../../../modules/base-components/webapp/core/ContextService';
import { Article } from '../../model/Article';
import { InlineContent } from '../../../../modules/base-components/webapp/core/InlineContent';
import { Channel } from '../../model/Channel';
import { ChannelProperty } from '../../model/ChannelProperty';
import { UserProperty } from '../../../user/model/UserProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { RoutingConfiguration } from '../../../../model/configuration/RoutingConfiguration';
import { ContextMode } from '../../../../model/ContextMode';
import { SenderType } from '../../model/SenderType';
import { TicketLock } from '../../model/TicketLock';
import { Watcher } from '../../model/Watcher';
import { EventService } from '../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../base-components/webapp/core/ApplicationEvent';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { Queue } from '../../model/Queue';
import { QueueProperty } from '../../model/QueueProperty';
import { TicketPriorityProperty } from '../../model/TicketPriorityProperty';
import { TicketStateProperty } from '../../model/TicketStateProperty';
import { TicketTypeProperty } from '../../model/TicketTypeProperty';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { CreateTicketArticleOptions } from '../../model/CreateTicketArticleOptions';
import { Error } from '../../../../../../server/model/Error';
import { TicketHistory } from '../../model/TicketHistory';
import { ArticleLoadingOptions } from '../../model/ArticleLoadingOptions';
import { DateTimeUtil } from '../../../base-components/webapp/core/DateTimeUtil';
import { Counter } from '../../../user/model/Counter';
import { ObjectSearch } from '../../../object-search/model/ObjectSearch';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { BackendSearchDataType } from '../../../../model/BackendSearchDataType';
import { TicketModuleConfiguration } from '../../model/TicketModuleConfiguration';
import { SysConfigService } from '../../../sysconfig/webapp/core';
import { AgentSocketClient } from '../../../user/webapp/core/AgentSocketClient';

export class TicketService extends KIXObjectService<Ticket> {

    private static INSTANCE: TicketService = null;

    public static getInstance(): TicketService {
        if (!TicketService.INSTANCE) {
            TicketService.INSTANCE = new TicketService();
        }

        return TicketService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.TICKET);
        this.objectConstructors.set(KIXObjectType.TICKET, [Ticket]);
        this.objectConstructors.set(KIXObjectType.ARTICLE, [Article]);
        this.objectConstructors.set(KIXObjectType.SENDER_TYPE, [SenderType]);
        this.objectConstructors.set(KIXObjectType.TICKET_LOCK, [TicketLock]);
        this.objectConstructors.set(KIXObjectType.WATCHER, [Watcher]);
        this.objectConstructors.set(KIXObjectType.TICKET_HISTORY, [TicketHistory]);
        this.objectConstructors.set(KIXObjectType.USER_TICKETS, [Ticket]);
        this.objectConstructors.set(KIXObjectType.USER_COUNTER, [Counter]);
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

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType | string, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions,
        cache: boolean = true, forceIds?: boolean, silent?: boolean, collectionId?: string
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.SENDER_TYPE) {
            objects = await super.loadObjects<O>(
                KIXObjectType.SENDER_TYPE, null, loadingOptions);
        } else if (objectType === KIXObjectType.TICKET_LOCK) {
            objects = await super.loadObjects<O>(KIXObjectType.TICKET_LOCK, null, loadingOptions);
        } else if (objectType === KIXObjectType.HTML_TO_PDF) {
            objects = await super.loadObjects<O>(objectType, null, loadingOptions, null, false);
        } else {
            superLoad = true;

            // get ticket id if necessary
            // (e.g. if article is loaded with DFs by FilterUtil=>checkCriteriaByPropertyValue)
            if (objectType === KIXObjectType.ARTICLE && !objectLoadingOptions) {
                const context = ContextService.getInstance().getActiveContext();
                if (context.descriptor.kixObjectTypes.includes(KIXObjectType.TICKET)) {
                    const ticketId = context.getObjectId();
                    if (ticketId) {
                        objectLoadingOptions = new ArticleLoadingOptions(ticketId);
                    }
                }

                // if still no option prevent loading of articles, but do not throw an error just a warning
                if (!objectLoadingOptions) {
                    console.warn(`Could not determine ticket id to load article(s) with id(s) "${objectIds?.toString()}"`);
                    return;
                }
            }

            objects = await super.loadObjects<O>(
                objectType, objectIds, loadingOptions, objectLoadingOptions, cache, forceIds, silent, collectionId
            );
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public getLinkObjectName(): string {
        return 'Ticket';
    }

    public async loadArticleAttachment(
        ticketId: number, articleId: number, attachmentId: number, asDownload?: boolean
    ): Promise<Attachment> {
        const attachment = await TicketSocketClient.getInstance().loadArticleAttachment(
            ticketId, articleId, attachmentId, asDownload
        );
        return attachment;
    }

    public async loadArticleZipAttachment(ticketId: number, articleId: number): Promise<Attachment> {
        const attachment = await TicketSocketClient.getInstance().loadArticleZipAttachment(
            ticketId, articleId
        );
        return attachment;
    }

    public async loadArticleAttachments(
        ticketId: number, articleId: number, attachmentIds: number[]
    ): Promise<Attachment[]> {
        const attachments = await TicketSocketClient.getInstance().loadArticleAttachments(
            ticketId, articleId, attachmentIds
        );
        return attachments;
    }

    public async setArticleSeenFlag(ticketId: number, articleId: number): Promise<void> {
        await AgentSocketClient.getInstance().markAsSeen(KIXObjectType.ARTICLE, [articleId])
            .then(() => EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR))
            .catch((error) => console.error(error));
    }

    public async markTicketAsSeen(ticketId: number): Promise<void> {
        await AgentSocketClient.getInstance().markAsSeen(KIXObjectType.TICKET, [ticketId])
            .then(() => EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR))
            .catch((error) => console.error(error));
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        const filter = [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.LIKE, FilterDataType.STRING, FilterType.AND, searchValue
            )
        ];

        const context = ContextService.getInstance().getActiveContext();
        const object = await context?.getObject();
        if (
            object?.KIXObjectType === KIXObjectType.TICKET
            && context?.descriptor?.contextMode === ContextMode.DETAILS
        ) {
            filter.push(
                new FilterCriteria(
                    TicketProperty.TICKET_ID, SearchOperator.NOT_EQUALS, FilterDataType.NUMERIC,
                    FilterType.AND, object.ObjectId
                )
            );
        }

        return filter;
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case TicketProperty.CREATED_QUEUE_ID:
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(false);
                nodes = await QueueService.getInstance().prepareObjectTree(
                    queuesHierarchy, showInvalid, invalidClickable,
                    filterIds ? filterIds.map((fid) => Number(fid)) : null
                );
                break;
            case TicketProperty.CREATED_TYPE_ID:
            case TicketProperty.TYPE_ID:
                let types = await KIXObjectService.loadObjects<TicketType>(KIXObjectType.TICKET_TYPE);
                if (!showInvalid) {
                    types = types.filter((t) => t.ValidID === 1);
                }
                for (const t of types) {
                    const icons = await LabelService.getInstance().getIconsForType(
                        KIXObjectType.TICKET, t, property, t.ID
                    );
                    const text = await LabelService.getInstance().getObjectText(t);
                    nodes.push(new TreeNode(
                        t.ID, text, (icons && icons.length) ? icons[0] : null, undefined, undefined, undefined,
                        undefined, undefined, undefined, undefined, undefined, undefined,
                        t.ValidID === 1 || invalidClickable,
                        undefined, undefined, undefined, undefined,
                        t.ValidID !== 1
                    ));
                }
                break;
            case TicketProperty.CREATED_PRIORITY_ID:
            case TicketProperty.PRIORITY_ID:
                let priorities = await KIXObjectService.loadObjects<TicketPriority>(KIXObjectType.TICKET_PRIORITY);
                if (!showInvalid) {
                    priorities = priorities.filter((p) => p.ValidID === 1);
                }
                for (const p of priorities) {
                    const icons = await LabelService.getInstance().getIconsForType(
                        KIXObjectType.TICKET, null, property, p.ID
                    );
                    const text = await LabelService.getInstance().getObjectText(p);
                    nodes.push(new TreeNode(
                        p.ID, text, (icons && icons.length) ? icons[0] : null, undefined, undefined, undefined,
                        undefined, undefined, undefined, undefined, undefined, undefined,
                        p.ValidID === 1 || invalidClickable,
                        undefined, undefined, undefined, undefined,
                        p.ValidID !== 1
                    ));
                }
                break;
            case TicketProperty.CREATED_STATE_ID:
            case TicketProperty.STATE_ID:
                let states = await KIXObjectService.loadObjects<TicketState>(KIXObjectType.TICKET_STATE);
                if (!showInvalid) {
                    states = states.filter((s) => s.ValidID === 1);
                }
                for (const s of states) {
                    const icons = await LabelService.getInstance().getIconsForType(
                        KIXObjectType.TICKET, null, property, s.ID
                    );
                    const text = await LabelService.getInstance().getObjectText(s);
                    nodes.push(new TreeNode(
                        s.ID, text, (icons && icons.length) ? icons[0] : null, undefined, undefined, undefined,
                        undefined, undefined, undefined, undefined, undefined, undefined,
                        s.ValidID === 1 || invalidClickable,
                        undefined, undefined, undefined, undefined,
                        s.ValidID !== 1
                    ));
                }
                break;
            case TicketProperty.STATE_TYPE:
                const openLabel = await TranslationService.translate('Translatable#Open');
                nodes.push(new TreeNode('Open', openLabel));

                const closedLabel = await TranslationService.translate('Translatable#Closed');
                nodes.push(new TreeNode('Closed', closedLabel));
                break;
            case TicketProperty.STATE_TYPE_ID:
                let stateTypes = await KIXObjectService.loadObjects<TicketState>(KIXObjectType.TICKET_STATE_TYPE);
                if (!showInvalid) {
                    stateTypes = stateTypes.filter((s) => s.ValidID === 1);
                }
                for (const s of stateTypes) {
                    const icons = await LabelService.getInstance().getIconsForType(
                        KIXObjectType.TICKET, null, property, s.ID
                    );
                    const text = await LabelService.getInstance().getObjectText(s);
                    nodes.push(new TreeNode(
                        s.ID, text, (icons && icons.length) ? icons[0] : null,
                        undefined, undefined, undefined, undefined, undefined, undefined,
                        undefined, undefined, undefined,
                        s.ValidID === 1 || invalidClickable,
                        undefined, undefined, undefined, undefined,
                        s.ValidID !== 1
                    ));
                }
                break;
            case TicketProperty.LOCK_ID:
                const unlocked = await TranslationService.translate('Translatable#Unlocked');
                const locked = await TranslationService.translate('Translatable#Locked');
                nodes.push(new TreeNode(1, unlocked, 'kix-icon-lock-open'));
                nodes.push(new TreeNode(2, locked, 'kix-icon-lock-close'));
                break;
            case TicketProperty.WATCHER_USER_ID:
            case TicketProperty.CREATED_USER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.OWNER_ID:
                if (loadingOptions) {
                    if (Array.isArray(loadingOptions.includes)) {
                        loadingOptions.includes.push(UserProperty.CONTACT);
                    } else {
                        loadingOptions.includes = [UserProperty.CONTACT];
                    }
                } else {
                    loadingOptions = new KIXObjectLoadingOptions(
                        null, null, null, [UserProperty.CONTACT], null
                    );
                }
                let users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, filterIds ? filterIds.map((fid) => Number(fid)) : null,
                    loadingOptions, null, true
                ).catch((error) => [] as User[]);
                if (!showInvalid) {
                    users = users.filter((s) => s.ValidID === 1);
                }
                users.forEach((u) => nodes.push(new TreeNode(
                    u.UserID, u.Contact ? u.Contact.Fullname : u.UserLogin, 'kix-icon-man',
                    undefined, undefined, undefined, undefined, undefined, undefined, undefined,
                    undefined, undefined,
                    u.ValidID === 1 || invalidClickable,
                    undefined, undefined, undefined, undefined,
                    u.ValidID !== 1
                )));
                break;
            case ArticleProperty.CHANNEL_ID:
                const channels = await KIXObjectService.loadObjects<Channel>(
                    KIXObjectType.CHANNEL, null, null, null, true
                ).catch(() => [] as Channel[]);

                for (const c of channels) {
                    const name = await LabelService.getInstance().getDisplayText(c, ChannelProperty.NAME);
                    const icons = await LabelService.getInstance().getIcons(c, ChannelProperty.ID);
                    nodes.push(new TreeNode(
                        c.ID, name, icons && icons.length ? icons[0] : null, undefined, undefined, undefined,
                        undefined, undefined, undefined, undefined, undefined, undefined,
                        c.ValidID === 1 || invalidClickable,
                        undefined, undefined, undefined, undefined,
                        c.ValidID !== 1
                    ));
                }
                break;
            case ArticleProperty.SENDER_TYPE_ID:
                const agent = await TranslationService.translate('Translatable#agent');
                const system = await TranslationService.translate('Translatable#system');
                const external = await TranslationService.translate('Translatable#external');
                nodes.push(new TreeNode(1, agent));
                nodes.push(new TreeNode(2, system));
                nodes.push(new TreeNode(3, external));
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
            case ArticleProperty.ENCRYPT_IF_POSSIBLE:
                const yes = await TranslationService.translate('Translatable#Yes');
                const no = await TranslationService.translate('Translatable#No');
                nodes.push(new TreeNode(0, no));
                nodes.push(new TreeNode(1, yes));
                break;
            case ArticleProperty.TO:
            case ArticleProperty.CC:
            case ArticleProperty.BCC:
                if (filterIds) {
                    const contactIds = filterIds.filter((id) => !isNaN(Number(id))).map((id) => Number(id));
                    const mailAddresses = filterIds.filter((id) => typeof id === 'string');
                    const contacts = await KIXObjectService.loadObjects(
                        KIXObjectType.CONTACT, contactIds, null, null, true
                    );
                    nodes = await KIXObjectService.prepareTree(contacts);
                    nodes.push(...mailAddresses.map((ma) => new TreeNode(ma?.toString(), ma?.toString())));
                }
                break;
            case TicketProperty.CONTACT_ID:
                if (Array.isArray(filterIds)) {
                    const contactIds = filterIds.filter((id) => !isNaN(Number(id))).map((id) => Number(id));
                    const contacts = await KIXObjectService.loadObjects(
                        KIXObjectType.CONTACT, contactIds, null, null, true
                    );
                    nodes = await KIXObjectService.prepareTree(contacts);
                }
                break;
            case TicketProperty.ORGANISATION_ID:
                if (Array.isArray(filterIds)) {
                    const organisations = await KIXObjectService.loadObjects(
                        KIXObjectType.ORGANISATION, filterIds
                    );
                    nodes = await KIXObjectService.prepareTree(organisations);
                }
                break;
            default:
                nodes = await super.getTreeNodes(property, showInvalid, invalidClickable, filterIds);
        }

        return nodes;
    }

    public async checkFilterValue(ticket: Ticket, criteria: UIFilterCriterion): Promise<boolean> {
        if (criteria.property === TicketProperty.WATCHERS) {
            return ticket.WatcherID > 0;
        }
        return true;
    }

    public determineDependendObjects(tickets: Ticket[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.CONTACT) {
            tickets.forEach((t) => {
                if (!ids.some((cid) => cid === t.ContactID) && !isNaN(Number(t.ContactID))) {
                    ids.push(t.ContactID);
                }
            });
        } else if (targetObjectType === KIXObjectType.ORGANISATION) {
            tickets.forEach((t) => {
                if (!ids.some((cid) => cid === t.OrganisationID) && !isNaN(Number(t.OrganisationID))) {
                    ids.push(t.OrganisationID);
                }
            });
        } else if (targetObjectType === KIXObjectType.CONFIG_ITEM) {
            ids = this.getLinkedObjectIds(tickets, KIXObjectType.CONFIG_ITEM);
        } else {
            ids = super.determineDependendObjects(tickets, targetObjectType);
        }

        return ids;
    }

    public static async isPendingState(stateId: number): Promise<boolean> {
        let pending = false;

        if (stateId) {
            const states = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, [stateId]
            );

            if (states && states.length) {
                const stateTypes = await KIXObjectService.loadObjects<StateType>(KIXObjectType.TICKET_STATE_TYPE);
                const stateType = stateTypes.find((t) => t.ID === states[0].TypeID);

                if (stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0) {
                    pending = true;
                }
            }
        }

        return pending;
    }


    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = ContextService.getInstance().getActiveContext();
        return context.descriptor.urlPaths[0] + '/' + id;
    }

    public async getPreparedArticleBodyContent(
        article: Article, removeInlineImages: boolean = false
    ): Promise<[string, InlineContent[], string]> {
        if (article.bodyAttachment) {
            const inlineAttachments = article.getInlineAttachments() || [];

            const attachmentIds = [article.bodyAttachment.ID, ...inlineAttachments.map((a) => a.ID)];
            const attachments = await this.loadArticleAttachments(
                article.TicketID, article.ArticleID, attachmentIds
            );

            const contentAttachment = attachments.find((a) => a.ID === article.bodyAttachment.ID);
            let mailContent = this.getContent(contentAttachment);

            let inlineContent = [];
            let content: string = mailContent[0];
            if (removeInlineImages) {
                // remove inline images
                content = content.replace(/<img.+?src="cid:.+?>/g, '');
            } else {
                const inline = attachments?.filter((a) => a.ID !== article.bodyAttachment.ID);
                inlineContent = await this.prepareInlineContent(inline);
            }

            return [content, inlineContent, mailContent[1]];
        } else {
            const body = article.Body.replace(/(\r\n|\n\r|\n|\r)/g, '<br>\n');
            return [body, null, null];
        }
    }

    private getContent(contentAttachment: Attachment): [string, string] {
        let buffer = Buffer.from(contentAttachment.Content, 'base64');
        const encoding = contentAttachment.charset ? contentAttachment.charset : 'utf8';
        if (encoding !== 'utf8' && encoding !== 'utf-8') {
            const iconv = require('iconv-lite');
            try {
                buffer = iconv.decode(buffer, encoding);
            } catch (e) {
                // do nothing
            }
        }

        let content = buffer.toString('utf8');
        let htmlContent: string = content;
        let styleContent: string;

        const bodyMatch = content.match(/(<body[^>]*>)([\w|\W]*)(<\/body>)/);
        if (bodyMatch && bodyMatch.length >= 3) {
            htmlContent = bodyMatch[2];
        } else if (!contentAttachment.Filename.match(/^file-(1|2|1\.html)$/)) {
            htmlContent = content.replace(/(\r\n|\n\r|\n|\r)/g, '<br>');
        }

        const styleMatch = content.match(/(<style[^>]*>)([\w|\W]*)(<\/style>)/);
        if (styleMatch && styleMatch.length >= 3) {
            styleContent = styleMatch[2];
        }

        return [htmlContent, styleContent];
    }

    private async prepareInlineContent(inlineAttachments: Attachment[]): Promise<InlineContent[]> {
        const inlineContent: InlineContent[] = [];

        for (const attachment of inlineAttachments) {
            const content = new InlineContent(attachment.ContentID, attachment.Content, attachment.ContentType);
            inlineContent.push(content);
        }

        return inlineContent;
    }

    protected getResource(objectType: KIXObjectType): string {
        if (objectType === KIXObjectType.TICKET) {
            return 'tickets';
        } else {
            return super.getResource(objectType);
        }
    }

    public getObjectRoutingConfiguration(object: KIXObject): RoutingConfiguration {
        if (object && object.KIXObjectType === KIXObjectType.ARTICLE) {
            return null;
        }
        return new RoutingConfiguration(
            TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET, ContextMode.DETAILS, TicketProperty.TICKET_ID
        );
    }

    public async createObjectByForm(
        objectType: KIXObjectType | string, formId: string, createOptions?: KIXObjectSpecificCreateOptions,
        cacheKeyPrefix?: string
    ): Promise<string | number> {
        if (objectType === KIXObjectType.ARTICLE) {
            const dialogContext = ContextService.getInstance().getActiveContext();
            const referencedTicketId = dialogContext?.getAdditionalInformation('REFERENCED_SOURCE_OBJECT_ID');
            if (referencedTicketId) {
                // TODO: keep given createOptions?
                const articleCreateOptions = new CreateTicketArticleOptions(referencedTicketId);
                return super.createObjectByForm(objectType, formId, articleCreateOptions, cacheKeyPrefix);
            } else {
                throw new Error('', 'Could not create article without ID of relevant ticket!');
            }
        }
        return super.createObjectByForm(objectType, formId, createOptions, cacheKeyPrefix);
    }

    public static async getDefaultQueueID(): Promise<number> {
        let queueId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.POSTMASTER_DEFAULT_QUEUE);
        if (name) {
            const queues = await KIXObjectService.loadObjects<Queue>(
                KIXObjectType.QUEUE, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            QueueProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            queueId = queues && !!queues.length ? queues[0].QueueID : null;
        }
        return queueId;
    }

    public static async getDefaultPriorityID(): Promise<number> {
        let priorityId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.POSTMASTER_DEFAULT_PRIORITY);
        if (name) {
            const objects = await KIXObjectService.loadObjects<TicketPriority>(
                KIXObjectType.TICKET_PRIORITY, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            TicketPriorityProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            priorityId = objects && !!objects.length ? objects[0].ID : null;
        }
        return priorityId;
    }

    public static async getDefaultTypeID(): Promise<number> {
        let typeId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.TICKET_TYPE_DEFAULT);
        if (name) {
            const objects = await KIXObjectService.loadObjects<TicketType>(
                KIXObjectType.TICKET_TYPE, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            TicketTypeProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            typeId = objects && !!objects.length ? objects[0].ID : null;
        }
        return typeId;
    }

    public static async getDefaultStateID(): Promise<number> {
        let stateId: number;
        const name = await this.getDefaultConfigValue(SysConfigKey.POSTMASTER_DEFAULT_STATE);
        if (name) {
            const objects = await KIXObjectService.loadObjects<TicketState>(
                KIXObjectType.TICKET_STATE, null, new KIXObjectLoadingOptions(
                    [
                        new FilterCriteria(
                            TicketStateProperty.NAME, SearchOperator.EQUALS, FilterDataType.STRING,
                            FilterType.AND, name
                        )
                    ]
                ), null, true
            );
            stateId = objects && !!objects.length ? objects[0].ID : null;
        }
        return stateId;
    }

    private static async getDefaultConfigValue(configId: string): Promise<string> {
        let name: string;
        if (configId) {
            const defaultOptions = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [configId], null, null, true
            );
            if (defaultOptions && !!defaultOptions.length) {
                name = defaultOptions[0].Value;
            }
        }
        return name;
    }

    public async getObjectProperties(objectType: KIXObjectType): Promise<string[]> {
        const superProperties = await super.getObjectProperties(objectType);

        const objectProperties = [
            TicketProperty.AGE,
            TicketProperty.CONTACT_ID,
            TicketProperty.LOCK_ID,
            TicketProperty.ORGANISATION_ID,
            TicketProperty.OWNER_ID,
            TicketProperty.PENDING_TIME,
            TicketProperty.PRIORITY_ID,
            TicketProperty.RESPONSIBLE_ID,
            TicketProperty.STATE_ID,
            TicketProperty.QUEUE_ID,
            TicketProperty.QUEUE_FULLNAME,
            TicketProperty.TICKET_NUMBER,
            TicketProperty.TITLE,
            TicketProperty.TYPE_ID,
            TicketProperty.UNSEEN,
            TicketProperty.CHANGED,
            KIXObjectProperty.CHANGE_BY,
            TicketProperty.CREATED,
            KIXObjectProperty.CREATE_BY,
            TicketProperty.WATCHER_ID
        ];

        return [...objectProperties, ...superProperties];
    }

    public static async getPendingDateDiff(value?: any): Promise<Date> {
        let offset: number;
        let date: Date;

        const timestamp = Date.parse(value);

        const offsetConfig = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_FRONTEND_PENDING_DIFF_TIME], null, null, true
        ).catch((error): SysConfigOption[] => []);

        if (value && isNaN(timestamp)) {
            const parts = value.split(/(\d+)/);
            if (parts.length === 3) {
                date = new Date(DateTimeUtil.calculateDate(Number(parts[1]), parts[2].toString()));
            }
        }
        else if (timestamp) {
            date = new Date(timestamp);
        }
        else if (offsetConfig?.length && offsetConfig[0].Value) {
            offset = Number(offsetConfig[0].Value);
        }
        else {
            offset = 86400;
        }

        if (offset) {
            date = this.getOffsetValue(offset);
        }
        return date;
    }

    protected static getOffsetValue(offset: number): Date {
        const date = new Date();
        date.setSeconds(date.getSeconds() + offset);
        return date;
    }

    public async getObjectTypeForProperty(property: string): Promise<KIXObjectType | string> {
        let objectType = await super.getObjectTypeForProperty(property);

        if (objectType === this.objectType) {
            switch (property) {
                case TicketProperty.OWNER_ID:
                case TicketProperty.RESPONSIBLE_ID:
                case TicketProperty.CREATED_USER_ID:
                case TicketProperty.WATCHER_USER_ID:
                    objectType = KIXObjectType.USER;
                    break;
                case TicketProperty.CONTACT_ID:
                case ArticleProperty.TO:
                case ArticleProperty.CC:
                case ArticleProperty.BCC:
                    objectType = KIXObjectType.CONTACT;
                    break;
                case TicketProperty.ORGANISATION_ID:
                    objectType = KIXObjectType.ORGANISATION;
                    break;
                case TicketProperty.TYPE_ID:
                case TicketProperty.CREATED_TYPE_ID:
                    objectType = KIXObjectType.TICKET_TYPE;
                    break;
                case TicketProperty.QUEUE_ID:
                case TicketProperty.CREATED_QUEUE_ID:
                    objectType = KIXObjectType.QUEUE;
                    break;
                case TicketProperty.PRIORITY_ID:
                case TicketProperty.CREATED_PRIORITY_ID:
                    objectType = KIXObjectType.TICKET_PRIORITY;
                    break;
                case TicketProperty.STATE_ID:
                case TicketProperty.CREATED_STATE_ID:
                    objectType = KIXObjectType.TICKET_STATE;
                    break;
                case TicketProperty.LOCK_ID:
                    objectType = KIXObjectType.TICKET_LOCK;
                    break;
                default:
            }
        }
        return objectType;
    }

    public async getSortableAttributes(filtered: boolean = true
    ): Promise<ObjectSearch[]> {
        const supportedAttributes = await super.getSortableAttributes(filtered);

        const filterList = [
            TicketProperty.CONTACT,
            TicketProperty.CREATED_PRIORITY_ID,
            TicketProperty.CREATED_QUEUE_ID,
            TicketProperty.CREATED_STATE_ID,
            TicketProperty.CREATED_TYPE_ID,
            TicketProperty.CREATED_USER_ID,
            TicketProperty.CREATED,
            TicketProperty.CHANGED,
            TicketProperty.CHANGE_TIME,
            TicketProperty.LOCK,
            TicketProperty.ORGANISATION,
            TicketProperty.OWNER,
            TicketProperty.PRIORITY,
            TicketProperty.QUEUE,
            TicketProperty.RESPONSIBLE,
            TicketProperty.STATE,
            TicketProperty.TYPE,
            'OrganisationNumber',
            'SLACriterion.EscalationStart',
            'SLACriterion.EscalationStop',
            TicketProperty.TICKET_ID
        ];
        return filtered ?
            supportedAttributes.filter((sA) => !filterList.some((fp) => fp === sA.Property)) :
            supportedAttributes;
    }

    public getSortAttribute(attribute: string, dep?: string): string {
        switch (attribute) {
            case TicketProperty.CONTACT_ID:
                return TicketProperty.CONTACT;
            case TicketProperty.LOCK_ID:
                return TicketProperty.LOCK;
            case TicketProperty.ORGANISATION_ID:
                return TicketProperty.ORGANISATION;
            case TicketProperty.OWNER_ID:
                return TicketProperty.OWNER;
            case TicketProperty.PRIORITY_ID:
                return TicketProperty.PRIORITY;
            case TicketProperty.QUEUE_ID:
            case TicketProperty.QUEUE_FULLNAME:
                return TicketProperty.QUEUE;
            case TicketProperty.RESPONSIBLE_ID:
                return TicketProperty.RESPONSIBLE;
            case TicketProperty.STATE_ID:
                return TicketProperty.STATE;
            case TicketProperty.TYPE_ID:
                return TicketProperty.TYPE;
            case TicketProperty.CREATED:
                return KIXObjectProperty.CREATE_TIME;
            case TicketProperty.CHANGED:
            case KIXObjectProperty.CHANGE_TIME:
                return TicketProperty.LAST_CHANGE_TIME;
            default:
        }
        return super.getSortAttribute(attribute, dep);
    }

    public async getFilterAttribute(attribute: string, dep?: string): Promise<string> {
        switch (attribute) {
            case TicketProperty.CREATED:
                return KIXObjectProperty.CREATE_TIME;
            case TicketProperty.CHANGED:
            case KIXObjectProperty.CHANGE_TIME:
                return TicketProperty.LAST_CHANGE_TIME;
            case TicketProperty.QUEUE_FULLNAME:
                return TicketProperty.QUEUE_ID;
            default:
        }
        return super.getFilterAttribute(attribute, dep);
    }

    protected async isBackendFilterSupportedForProperty(
        objectType: KIXObjectType | string,
        property: string,
        supportedAttributes: ObjectSearch[],
        dep?: string,
        allowDates: boolean = false
    ): Promise<boolean> {
        const filterList = [
            // TODO: currently date/time is not supported (in FE)
            //TicketProperty.CREATED,
            TicketProperty.CREATED_TIME_UNIX,
            //TicketProperty.CHANGED,
            TicketProperty.LAST_CHANGE_TIME,
            TicketProperty.ARTICLE_CREATE_TIME,
            //TicketProperty.PENDING_TIME,
            TicketProperty.PENDING_TIME_UNIX,
            TicketProperty.UNTIL_TIME,
            TicketProperty.AGE,

            'OrganisationNumber'
        ];
        if (!allowDates) {
            filterList.push(...[TicketProperty.CREATED, TicketProperty.CHANGED, TicketProperty.PENDING_TIME]);
        }
        if (filterList.some((f) => f === property)) {
            return false;
        }
        return super.isBackendFilterSupportedForProperty(objectType, property, supportedAttributes, dep, allowDates);
    }

    protected async getBackendFilterType(property: string, dep?: string): Promise<BackendSearchDataType | string> {
        switch (property) {
            case TicketProperty.CONTACT_ID:
            case TicketProperty.ORGANISATION_ID:
            case TicketProperty.OWNER_ID:
            case TicketProperty.RESPONSIBLE_ID:
                return 'Autocomplete';
            // use dropdown (Open, Closed)
            case TicketProperty.STATE_TYPE:
                return BackendSearchDataType.NUMERIC;
            default:
        }
        return super.getBackendFilterType(property, dep);
    }

    public async getObjectDependencies(objectType: KIXObjectType): Promise<KIXObject[]> {
        return KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE);
    }

    public async getObjectDependencyName(objectType: KIXObjectType | string): Promise<string> {
        return LabelService.getInstance().getPropertyText(TicketProperty.QUEUE, objectType);
    }

    public static async getTicketModuleConfiguration(): Promise<TicketModuleConfiguration> {
        let config: TicketModuleConfiguration;

        const value = await SysConfigService.getInstance().getSysConfigOptionValue(
            TicketModuleConfiguration.CONFIGURATION_ID
        ).catch(() => null);
        if (value) {
            try {
                config = JSON.parse(value);
            } catch (error) {
                console.error('Could not parse Ticket Module Configuration');
            }
        }

        return config as any;
    }

}
