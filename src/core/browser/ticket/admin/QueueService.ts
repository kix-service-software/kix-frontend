import { KIXObjectService } from "../../kix";
import {
    KIXObjectType, KIXObjectSpecificLoadingOptions, KIXObjectLoadingOptions, KIXObject, Queue,
    TreeNode, ObjectIcon, FilterCriteria, FilterDataType, FilterType, QueueProperty, FormFieldOption, FollowUpType
} from "../../../model";
import { SearchOperator } from "../../SearchOperator";
import { LabelService } from "../../LabelService";

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

    public prepareQueueTree(queues: Queue[], options?: FormFieldOption[]): TreeNode[] {
        let nodes = [];
        if (queues && !!queues.length) {
            const validOption = options ? options.find((o) => o.option === 'showValid') : null;
            if (!validOption || !validOption.value) {
                queues = queues.filter((q) => q.ValidID === 1);
            }
            nodes = queues.map((queue: Queue) => {
                const treeNode = new TreeNode(
                    queue.QueueID, queue.Name,
                    new ObjectIcon('Queue', queue.QueueID),
                    null,
                    this.prepareQueueTree(queue.SubQueues, options),
                    null, null, null, null, null, null, null, queue.ValidID === 1 ? true : false
                );
                return treeNode;
            });
        }
        return nodes;
    }

    public async getQueuesHierarchy(): Promise<Queue[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, [
            new FilterCriteria(
                QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
            )
        ], null, null, ['SubQueues', 'TicketStats', 'Tickets'], ['SubQueues']);

        return await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, null, loadingOptions);
    }

    public async getTreeNodes(property: string, options?: FormFieldOption[]): Promise<TreeNode[]> {
        const values: TreeNode[] = [];

        const labelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.QUEUE);

        switch (property) {
            case QueueProperty.FOLLOW_UP_ID:
                let followUpTypes = await KIXObjectService.loadObjects<FollowUpType>(KIXObjectType.FOLLOW_UP_TYPE);
                const validOption = options ? options.find((o) => o.option === 'showValid') : null;
                if (!validOption || !validOption.value) {
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
