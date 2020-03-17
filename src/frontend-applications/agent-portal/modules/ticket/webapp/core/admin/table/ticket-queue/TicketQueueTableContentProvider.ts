/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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

    protected hasChildRows(rowObject: RowObject<Queue>): boolean {
        return rowObject && rowObject.getObject().SubQueues && rowObject.getObject().SubQueues.length !== 0;
    }

    protected async addChildRows(
        rowObject: RowObject<Queue>, propertyMap: Map<string, Map<any, TableValue>>
    ): Promise<void> {
        const rows = await this.getRowObjects(rowObject.getObject().SubQueues, propertyMap);
        rows.forEach((r) => rowObject.addChild(r));
    }
}
