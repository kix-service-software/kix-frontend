import { TicketDetailsContext } from '.';
import { SearchOperator, ContextService } from '..';
import {
    Attachment, KIXObjectType, Ticket, TicketProperty, FilterDataType, FilterCriteria, FilterType,
    TreeNode, ObjectIcon, Queue, Service, TicketPriority, TicketType,
    TicketState, StateType, KIXObject, Sla, TableFilterCriteria, User, KIXObjectLoadingOptions
} from '../../model';
import { TicketParameterUtil } from './TicketParameterUtil';
import { KIXObjectService } from '../kix';
import { SearchProperty } from '../SearchProperty';
import { LabelService } from '../LabelService';
import { ObjectDataService } from '../ObjectDataService';
import { TicketSocketClient } from './TicketSocketClient';

export class TicketService extends KIXObjectService<Ticket> {

    private static INSTANCE: TicketService = null;

    public static getInstance(): TicketService {
        if (!TicketService.INSTANCE) {
            TicketService.INSTANCE = new TicketService();
        }

        return TicketService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.TICKET
            || kixObjectType === KIXObjectType.ARTICLE
            || kixObjectType === KIXObjectType.QUEUE
            || kixObjectType === KIXObjectType.ARTICLE_TYPE
            || kixObjectType === KIXObjectType.SENDER_TYPE
            || kixObjectType === KIXObjectType.LOCK
            || kixObjectType === KIXObjectType.WATCHER;
    }

    public getLinkObjectName(): string {
        return "Ticket";
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.prepareValue(property, value);
    }

    protected async prepareUpdateValue(property: string, value: any): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.prepareValue(property, value, true);
    }

    protected async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return await TicketParameterUtil.getPredefinedParameter(forUpdate);
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

    public prepareFullTextFilter(searchValue: string): FilterCriteria[] {
        return [
            new FilterCriteria(
                SearchProperty.FULLTEXT, SearchOperator.CONTAINS, FilterDataType.STRING, FilterType.OR, searchValue
            )
        ];
    }

    public async getTreeNodes(property: string): Promise<TreeNode[]> {
        let values: TreeNode[] = [];

        const objectData = ObjectDataService.getInstance().getObjectData();

        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.TICKET);

        switch (property) {
            case TicketProperty.QUEUE_ID:
                const queuesHierarchy = await this.getQueuesHierarchy();
                values = queuesHierarchy ? this.prepareQueueTree(queuesHierarchy) : [];
                break;
            case TicketProperty.SERVICE_ID:
                values = this.prepareServiceTree(objectData.servicesHierarchy);
                break;
            case TicketProperty.TYPE_ID:
                let types = await KIXObjectService.loadObjects<TicketType>(KIXObjectType.TICKET_TYPE);
                types = types.filter((t) => t.ValidID === 1);
                for (const t of types) {
                    const icons = await labelProvider.getIcons(null, property, t.ID);
                    values.push(new TreeNode(t.ID, t.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            case TicketProperty.PRIORITY_ID:
                let priorities = await KIXObjectService.loadObjects<TicketPriority>(KIXObjectType.TICKET_PRIORITY);
                priorities = priorities.filter((p) => p.ValidID === 1);
                for (const p of priorities) {
                    const icons = await labelProvider.getIcons(null, property, p.ID);
                    values.push(new TreeNode(p.ID, p.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            case TicketProperty.STATE_ID:
                let states = await KIXObjectService.loadObjects<TicketState>(KIXObjectType.TICKET_STATE);
                states = states.filter((s) => s.ValidID === 1);
                for (const s of states) {
                    const icons = await labelProvider.getIcons(null, property, s.ID);
                    values.push(new TreeNode(s.ID, s.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            case TicketProperty.SLA_ID:
                const slas = await KIXObjectService.loadObjects<Sla>(KIXObjectType.SLA);
                slas.forEach((s) => values.push(new TreeNode(s.SLAID, s.Name, null)));
                break;
            case TicketProperty.LOCK_ID:
                values.push(new TreeNode(1, 'freigegeben', 'kix-icon-lock-open'));
                values.push(new TreeNode(2, 'gesperrt', 'kix-icon-lock-close'));
                break;
            case TicketProperty.RESPONSIBLE_ID:
            case TicketProperty.OWNER_ID:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, null, null, null, true, true
                ).catch((error) => [] as User[]);
                users.forEach((u) => values.push(new TreeNode(u.UserID, u.UserFullname, 'kix-icon-man')));
                break;
            default:
        }

        return values;
    }

    private prepareQueueTree(queues: Queue[]): TreeNode[] {
        let nodes = [];
        if (queues) {
            nodes = queues.filter((q) => q.ValidID === 1).map((queue: Queue) => {
                const treeNode = new TreeNode(
                    queue.QueueID, queue.Name,
                    new ObjectIcon('Queue', queue.QueueID),
                    null,
                    this.prepareQueueTree(queue.SubQueues)
                );
                return treeNode;
            });
        }
        return nodes;
    }

    private prepareServiceTree(services: Service[]): TreeNode[] {
        let nodes = [];
        if (services) {
            nodes = services.filter((s) => s.ValidID === 1).map((service: Service) => {
                return new TreeNode(
                    service.ServiceID, service.Name,
                    new ObjectIcon(TicketProperty.SERVICE_ID, service.ServiceID),
                    new ObjectIcon('CurInciStateID', service.IncidentState.CurInciStateID),
                    this.prepareServiceTree(service.SubServices)
                );
            });
        }
        return nodes;
    }

    public checkFilterValue(ticket: Ticket, criteria: TableFilterCriteria): boolean {
        if (criteria.property === TicketProperty.WATCHERS && ticket.Watchers) {
            let value = criteria.value;
            if (criteria.value === KIXObjectType.CURRENT_USER) {
                value = ObjectDataService.getInstance().getObjectData().currentUser.UserID;
            }
            return ticket.Watchers.some((w) => w.UserID === value);
        }
        return true;
    }

    public determineDependendObjects(tickets: Ticket[], targetObjectType: KIXObjectType): string[] | number[] {
        let ids = [];

        if (targetObjectType === KIXObjectType.CONTACT) {
            tickets.forEach((t) => {
                if (!ids.some((cid) => cid === t.CustomerUserID)) {
                    ids.push(t.CustomerUserID);
                }
            });
        } else if (targetObjectType === KIXObjectType.CUSTOMER) {
            tickets.forEach((t) => {
                if (!ids.some((cid) => cid === t.CustomerID)) {
                    ids.push(t.CustomerID);
                }
            });
        } else if (targetObjectType === KIXObjectType.CONFIG_ITEM) {
            ids = this.getLinkedObjectIds(tickets, KIXObjectType.CONFIG_ITEM);
        } else {
            ids = super.determineDependendObjects(tickets, targetObjectType);
        }

        return ids;
    }

    public async hasPendingState(ticket: Ticket): Promise<boolean> {
        return this.isPendingState(ticket.StateID);
    }

    public async isPendingState(stateId: number): Promise<boolean> {
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

    public async getQueuesHierarchy(): Promise<Queue[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, [
            new FilterCriteria('ParentID', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null)
        ], null, null, null, ['SubQueues', 'TicketStats', 'Tickets'], ['SubQueues']);
        return await KIXObjectService.loadObjects<Queue>(
            KIXObjectType.QUEUE, null, loadingOptions
        );
    }
}
