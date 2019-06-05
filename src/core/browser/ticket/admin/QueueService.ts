import { KIXObjectService } from "../../kix";
import {
    KIXObjectType, KIXObjectSpecificLoadingOptions, KIXObjectLoadingOptions, KIXObject, Queue,
    TreeNode, ObjectIcon, FilterCriteria, FilterDataType, FilterType, QueueProperty,
    FollowUpType, TreeNodeProperty
} from "../../../model";
import { SearchOperator } from "../../SearchOperator";
import { LabelService } from "../../LabelService";
import { TranslationService } from "../../i18n/TranslationService";

export class QueueService extends KIXObjectService<Queue> {

    private static INSTANCE: QueueService = null;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }

        return QueueService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.QUEUE
            || kixObjectType === KIXObjectType.FOLLOW_UP_TYPE;
    }

    public getLinkObjectName(): string {
        return 'Queue';
    }

    public async loadObjects<O extends KIXObject>(
        objectType: KIXObjectType, objectIds: Array<string | number>,
        loadingOptions?: KIXObjectLoadingOptions, objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<O[]> {
        let objects: O[];
        let superLoad = false;
        if (objectType === KIXObjectType.FOLLOW_UP_TYPE) {
            objects = await super.loadObjects<O>(KIXObjectType.FOLLOW_UP_TYPE, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case QueueProperty.FOLLOW_UP_LOCK:
                value = Number(value);
                break;
            default:
        }
        return [[property, value]];
    }

    public async prepareQueueTree(
        queues: Queue[], showInvalid?: boolean, filterIds?: number[], includeTicketStats: boolean = false
    ): Promise<TreeNode[]> {
        const nodes = [];
        if (queues && !!queues.length) {
            if (!showInvalid) {
                queues = queues.filter((q) => q.ValidID === 1);
            }

            if (filterIds && filterIds.length) {
                queues = queues.filter((q) => !filterIds.some((fid) => fid === q.QueueID));
            }

            for (const queue of queues) {
                let ticketStats = [];
                if (includeTicketStats) {
                    ticketStats = await this.getTicketStats(queue);
                }

                const subTree = await this.prepareQueueTree(
                    queue.SubQueues, showInvalid, filterIds, includeTicketStats
                );
                const treeNode = new TreeNode(
                    queue.QueueID, queue.Name,
                    new ObjectIcon(KIXObjectType.QUEUE, queue.QueueID),
                    null,
                    subTree,
                    null, null, null,
                    ticketStats,
                    null, null, null, queue.ValidID === 1 ? true : false
                );
                nodes.push(treeNode);
            }
        }
        return nodes;
    }

    private async getTicketStats(queue: Queue): Promise<TreeNodeProperty[]> {
        const properties: TreeNodeProperty[] = [];
        if (queue.TicketStats) {
            const openCount = queue.TicketStats.OpenCount;

            const openTooltip = await TranslationService.translate('Translatable#open tickets: {0}', [openCount]);
            properties.push(new TreeNodeProperty(openCount, openTooltip));

            const lockCount = openCount - queue.TicketStats.LockCount;
            const lockedTooltip = await TranslationService.translate('Translatable#free tickets: {0}', [lockCount]);
            properties.push(new TreeNodeProperty(lockCount, lockedTooltip));

            const escalatedCount = queue.TicketStats.EscalatedCount;
            if (escalatedCount > 0) {
                const escalatedTooltip = await TranslationService.translate(
                    'Translatable#escalated tickets: {0}', [escalatedCount]
                );
                properties.push(
                    new TreeNodeProperty(escalatedCount, escalatedTooltip, 'escalated')
                );
            }
        }

        return properties;
    }

    public async getQueuesHierarchy(): Promise<Queue[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, [
            new FilterCriteria(
                QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
            )
        ], null, null, [QueueProperty.SUB_QUEUES, 'TicketStats', 'Tickets'], [QueueProperty.SUB_QUEUES]);

        return await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, null, loadingOptions);
    }

    public async getTreeNodes(property: string, showInvalid?: boolean): Promise<TreeNode[]> {
        const values: TreeNode[] = [];

        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.QUEUE);

        switch (property) {
            case QueueProperty.FOLLOW_UP_ID:
                let followUpTypes = await KIXObjectService.loadObjects<FollowUpType>(KIXObjectType.FOLLOW_UP_TYPE);
                if (!showInvalid) {
                    followUpTypes = followUpTypes.filter((q) => q.ValidID === 1);
                }
                for (const type of followUpTypes) {
                    const icons = await labelProvider.getIcons(null, property, type.ID);
                    values.push(new TreeNode(type.ID, type.Name, (icons && icons.length) ? icons[0] : null));
                }
                break;
            default:
        }

        return values;
    }
}
