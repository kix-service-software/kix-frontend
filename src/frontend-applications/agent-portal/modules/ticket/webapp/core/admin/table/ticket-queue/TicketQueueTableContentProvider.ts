/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../../table/webapp/core/TableContentProvider';
import { Queue } from '../../../../../model/Queue';
import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { RowObject } from '../../../../../../table/model/RowObject';
import { Table } from '../../../../../../table/model/Table';
import { QueueService } from '../../QueueService';


export class TicketQueueTableContentProvider extends TableContentProvider<Queue> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.QUEUE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<Queue>>> {
        const queues = await QueueService.getInstance().getQueuesHierarchy();
        return await this.getRowObjects(queues);
    }

    protected hasChildRows(rowObject: RowObject<Queue>): boolean {
        return rowObject && rowObject.getObject().SubQueues && rowObject.getObject().SubQueues.length !== 0;
    }

    protected async addChildRows(
        rowObject: RowObject<Queue>
    ): Promise<void> {
        const rows = await this.getRowObjects(rowObject.getObject().SubQueues);
        rows.forEach((r) => rowObject.addChild(r));
    }
}
