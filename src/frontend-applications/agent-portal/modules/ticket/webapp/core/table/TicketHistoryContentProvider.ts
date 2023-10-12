/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { TicketHistory } from '../../../model/TicketHistory';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class TicketHistoryContentProvider extends TableContentProvider<TicketHistory> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET_HISTORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<TicketHistory>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const history = await context.getObjectList<TicketHistory>(KIXObjectType.TICKET_HISTORY);
            for (const th of history) {
                const values: TableValue[] = [];

                const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                for (const column of columns) {
                    const tableValue = new TableValue(column.property, th[column.property]);
                    values.push(tableValue);
                }

                rowObjects.push(new RowObject<TicketHistory>(values, th));
            }
        }

        return rowObjects;
    }

}
