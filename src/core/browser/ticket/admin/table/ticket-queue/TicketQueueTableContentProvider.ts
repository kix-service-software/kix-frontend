import { TableContentProvider } from "../../../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, Queue, FilterCriteria, QueueProperty, FilterDataType, FilterType
} from "../../../../../model";
import { ITable, IRowObject, RowObject, TableValue } from "../../../../table";
import { SearchOperator } from "../../../../SearchOperator";
import { KIXObjectService } from "../../../../kix";

export class TicketQueueTableContentProvider extends TableContentProvider<Queue> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.QUEUE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Queue>>> {

        const queueFilter = [
            new FilterCriteria(
                QueueProperty.PARENT_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, null
            )
        ];
        const loadingOptions = new KIXObjectLoadingOptions(null, queueFilter, null, null, null,
            ['SubQueues'], ['SubQueues']
        );

        const queues = await KIXObjectService.loadObjects<Queue>(
            KIXObjectType.QUEUE, null, loadingOptions
        );

        const rowObjects = [];
        queues.forEach((fc) => {
            rowObjects.push(this.createRowObject(fc));
        });

        return rowObjects;
    }

    private createRowObject(queue: Queue): RowObject {
        const values: TableValue[] = [];

        for (const property in queue) {
            if (queue.hasOwnProperty(property)) {
                values.push(new TableValue(property, queue[property]));
            }
        }

        const rowObject = new RowObject<Queue>(values, queue);

        if (queue.SubQueues && Array.isArray(queue.SubQueues) && queue.SubQueues.length) {
            queue.SubQueues.forEach((sq) => {
                rowObject.addChild(this.createRowObject(sq));
            });
        }

        return rowObject;
    }
}
