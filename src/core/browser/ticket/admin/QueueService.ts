import { KIXObjectService } from "../../kix";
import {
    KIXObjectType, KIXObjectSpecificLoadingOptions, KIXObjectLoadingOptions, KIXObject, Queue,
    TreeNode, ObjectIcon, FilterCriteria, FilterDataType, FilterType, QueueProperty
} from "../../../model";
import { SearchOperator } from "../../SearchOperator";

export class QueueService extends KIXObjectService<Queue> {

    private static INSTANCE: QueueService = null;

    public static getInstance(): QueueService {
        if (!QueueService.INSTANCE) {
            QueueService.INSTANCE = new QueueService();
        }

        return QueueService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.QUEUE;
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
        if (objectType === KIXObjectType.QUEUE) {
            objects = await super.loadObjects<O>(KIXObjectType.QUEUE, null, loadingOptions);
        } else {
            superLoad = true;
            objects = await super.loadObjects<O>(objectType, objectIds, loadingOptions, objectLoadingOptions);
        }

        if (objectIds && !superLoad) {
            objects = objects.filter((c) => objectIds.some((oid) => c.ObjectId === oid));
        }

        return objects;
    }

    public prepareQueueTree(queues: Queue[]): TreeNode[] {
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

    public async getQueuesHierarchy(): Promise<Queue[]> {
        const loadingOptions = new KIXObjectLoadingOptions(null, [
            new FilterCriteria(
                QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, null
            )
        ], null, null, null, ['SubQueues', 'TicketStats', 'Tickets'], ['SubQueues']);

        return await KIXObjectService.loadObjects<Queue>(KIXObjectType.QUEUE, null, loadingOptions);
    }
}
