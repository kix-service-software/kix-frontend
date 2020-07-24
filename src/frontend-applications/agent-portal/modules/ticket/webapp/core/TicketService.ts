/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { TableFilterCriteria } from '../../../../model/TableFilterCriteria';
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
    }

    public async prepareFullTextFilter(searchValue: string): Promise<FilterCriteria[]> {
        return [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(false);
                nodes = await QueueService.getInstance().prepareObjectTree(
                    queuesHierarchy, showInvalid, invalidClickable,
                    filterIds ? filterIds.map((fid) => Number(fid)) : null
                );
                break;
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
            case TicketProperty.LOCK_ID:
                const unlocked = await TranslationService.translate('Translatable#Unlocked');
                const locked = await TranslationService.translate('Translatable#Locked');
                nodes.push(new TreeNode(1, unlocked, 'kix-icon-lock-open'));
                nodes.push(new TreeNode(2, locked, 'kix-icon-lock-close'));
                break;
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.OWNER_ID:
                if (loadingOptions) {
                    if (Array.isArray(loadingOptions.includes)) {
                        loadingOptions.includes.push(UserProperty.CONTACT);
                    } else {
                        loadingOptions.includes = [UserProperty.CONTACT];
                    }

                    if (Array.isArray(loadingOptions.query)) {
                        loadingOptions.query.push(['requiredPermission', 'TicketRead,TicketUpdate']);
                    } else {
                        loadingOptions.query = [['requiredPermission', 'TicketRead,TicketUpdate']];
                    }
                } else {
                    loadingOptions = new KIXObjectLoadingOptions(
                        null, null, null, [UserProperty.CONTACT], null,
                        [['requiredPermission', 'TicketRead,TicketUpdate']]
                    );
                }
                let users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, null, loadingOptions, null, true
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
                nodes.push(new TreeNode(1, 'agent'));
                nodes.push(new TreeNode(2, 'system'));
                nodes.push(new TreeNode(3, 'external'));
                break;
            case ArticleProperty.CUSTOMER_VISIBLE:
                nodes.push(new TreeNode(0, 'No'));
                nodes.push(new TreeNode(1, 'Yes'));
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

    public async checkFilterValue(ticket: Ticket, criteria: TableFilterCriteria): Promise<boolean> {
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
        const context = await ContextService.getInstance().getContext(TicketDetailsContext.CONTEXT_ID);
        return context.getDescriptor().urlPaths[0] + '/' + id;
    }

    public async getPreparedArticleBodyContent(article: Article): Promise<[string, InlineContent[]]> {
        if (article.bodyAttachment) {

            const AttachmentWithContent = await this.loadArticleAttachment(
                article.TicketID, article.ArticleID, article.bodyAttachment.ID
            );

            const inlineAttachments = article.Attachments.filter((a) => a.Disposition === 'inline');
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

            let content = Buffer.from(AttachmentWithContent.Content, 'base64').toString('utf8');
            const match = content.match(/(<body[^>]*>)([\w|\W]*)(<\/body>)/);
            if (match && match.length >= 3) {
                console.table(match);
                content = match[2];
            }

            return [content, inlineContent];
        } else {
            return [article.Body, null];
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
}
