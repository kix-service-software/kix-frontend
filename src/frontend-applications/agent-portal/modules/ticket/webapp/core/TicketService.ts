/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { AgentService } from '../../../user/webapp/core/AgentService';
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
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET
            || kixObjectType === KIXObjectType.ARTICLE
            || kixObjectType === KIXObjectType.SENDER_TYPE
            || kixObjectType === KIXObjectType.TICKET_LOCK
            || kixObjectType === KIXObjectType.WATCHER;
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.SENDER_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.SENDER_TYPE, null, loadingOptions);
        } else if (objectType === KIXObjectType.TICKET_LOCK) {
            objects = await super.loadObjects<O>(KIXObjectType.TICKET_LOCK, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.map((id) => Number(id)).some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public getLinkObjectName(): string {
        return 'Ticket';
    }

    public async loadArticleAttachment(ticketId: number, articleId: number, attachmentId: number): Promise<Attachment> {
        const attachment = await TicketSocketClient.getInstance().loadArticleAttachment(
            ticketId, articleId, attachmentId
        );
        return attachment;
    }

    public async loadArticleZipAttachment(ticketId: number, articleId: number): Promise<Attachment> {
        const attachment = await TicketSocketClient.getInstance().loadArticleZipAttachment(
            ticketId, articleId
        );
        return attachment;
    }

    public async setArticleSeenFlag(ticketId: number, articleId: number): Promise<void> {
        await TicketSocketClient.getInstance().setArticleSeenFlag(ticketId, articleId);
        EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR);
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        const filter = [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
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
            case TicketProperty.WATCH_USER_ID:
            case TicketProperty.CREATED_USER_ID:
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.OWNER_ID:
                if (loadingOptions) {
                    if (Array.isArray(loadingOptions.includes)) {
                        loadingOptions.includes.push(UserProperty.CONTACT);
                    } else {
                        loadingOptions.includes = [UserProperty.CONTACT];
                    }

                    if (Array.isArray(loadingOptions.query)) {
                        loadingOptions.query.push(['requiredPermission', 'TicketRead,TicketCreate']);
                    } else {
                        loadingOptions.query = [['requiredPermission', 'TicketRead,TicketCreate']];
                    }
                } else {
                    loadingOptions = new KIXObjectLoadingOptions(
                        null, null, null, [UserProperty.CONTACT], null,
                        [['requiredPermission', 'TicketRead,TicketCreate']]
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
                const yes = await TranslationService.translate('Translatable#Yes');
                const no = await TranslationService.translate('Translatable#No');
                nodes.push(new TreeNode(0, no));
                nodes.push(new TreeNode(1, yes));
                break;
            case ArticleProperty.TO:
            case ArticleProperty.CC:
            case ArticleProperty.BCC:
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
        if (criteria.property === TicketProperty.WATCHERS && ticket.Watchers) {
            let value = criteria.value;
            if (criteria.value === KIXObjectType.CURRENT_USER) {
                const currentUser = await AgentService.getInstance().getCurrentUser();
                value = currentUser.UserID;
            }
            return ticket.Watchers.some((w) => w.UserID === value);
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

        const states = await KIXObjectService.loadObjects<TicketState>(
            KIXObjectType.TICKET_STATE, [stateId]
        );

        if (states && states.length) {
            const stateTypes = await KIXObjectService.loadObjects<StateType>(
                KIXObjectType.TICKET_STATE_TYPE, null
            );
            const stateType = stateTypes.find((t) => t.ID === states[0].TypeID);

            if (stateType && stateType.Name.toLocaleLowerCase().indexOf('pending') >= 0) {
                pending = true;
            }
        }

        return pending;
    }


    public async getObjectUrl(object?: KIXObject, objectId?: string | number): Promise<string> {
        const id = object ? object.ObjectId : objectId;
        const context = ContextService.getInstance().getActiveContext();
        return context.descriptor.urlPaths[0] + '/' + id;
    }

    public async getPreparedArticleBodyContent(article: Article): Promise<[string, InlineContent[]]> {
        if (article.bodyAttachment) {

            const attachmentWithContent = await this.loadArticleAttachment(
                article.TicketID, article.ArticleID, article.bodyAttachment.ID
            );

            const inlineAttachments = article.getAttachments(true);
            for (const inlineAttachment of inlineAttachments) {
                const attachment = await this.loadArticleAttachment(
                    article.TicketID, article.ArticleID, inlineAttachment.ID
                );
                if (attachment) {
                    inlineAttachment.Content = attachment.Content;
                }
            }

            const inlineContent: InlineContent[] = [];
            inlineAttachments.forEach(
                (a) => inlineContent.push(new InlineContent(a.ContentID, a.Content, a.ContentType))
            );

            let buffer = Buffer.from(attachmentWithContent.Content, 'base64');
            const encoding = attachmentWithContent.charset ? attachmentWithContent.charset : 'utf8';
            if (encoding !== 'utf8' && encoding !== 'utf-8') {
                const iconv = require('iconv-lite');
                try {
                    buffer = iconv.decode(buffer, encoding);
                } catch (e) {
                    // do nothing
                }
            }

            let content = buffer.toString('utf8');
            const match = content.match(/(<body[^>]*>)([\w|\W]*)(<\/body>)/);
            if (match && match.length >= 3) {
                content = match[2];
            }

            return [content, inlineContent];
        } else {
            const body = article.Body.replace(/(\n|\r)/g, '<br>');
            return [body, null];
        }
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
            const referencedTicketId = dialogContext?.getAdditionalInformation('REFERENCED_TICKET_ID');
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
        const objectProperties: string[] = [];
        for (const property in TicketProperty) {
            if (TicketProperty[property]) {
                objectProperties.push(TicketProperty[property]);
            }
        }
        return [...objectProperties, ...superProperties];
    }
}
