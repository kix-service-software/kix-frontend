/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../../../base-components/webapp/core/table/TableContentProvider";
import { Queue } from "../../../../../model/Queue";
import { ITable, IRowObject, RowObject, TableValue } from "../../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../../../model/kix/KIXObjectType";
import { KIXObjectService } from "../../../../../../../modules/base-components/webapp/core/KIXObjectService";

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

        const queues = await KIXObjectService.loadObjects<Queue>(
            KIXObjectType.QUEUE, null, this.loadingOptions
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
