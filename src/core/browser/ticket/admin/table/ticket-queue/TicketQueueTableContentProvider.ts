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
            rowObjects.push(this.createRow(fc, null));
        });

        return rowObjects;
    }

    private createRow(queue: Queue, parent: RowObject): RowObject {
        const values: TableValue[] = [];

        for (const property in queue) {
            if (queue.hasOwnProperty(property)) {
                values.push(new TableValue(property, queue[property]));
            }
        }

        const rowObject = new RowObject<Queue>(values, queue);

        if (queue.SubQueues) {
            queue.SubQueues.forEach((sc) => {
                const row = this.createRow(sc, rowObject);
                if (parent) {
                    parent.addChild(row);
                } else {
                    rowObject.addChild(row);
                }
            });
        }

        return rowObject;
    }
}
