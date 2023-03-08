/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { ConfigItemHistory } from '../../../model/ConfigItemHistory';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { ConfigItem } from '../../../model/ConfigItem';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class ConfigItemHistoryContentProvider extends TableContentProvider<ConfigItemHistory> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_HISTORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<ConfigItemHistory>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const configItem = await context.getObject<ConfigItem>();
            if (configItem) {
                for (const ch of configItem.History) {
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        const tableValue = new TableValue(column.property, ch[column.property]);
                        values.push(tableValue);
                    }

                    rowObjects.push(new RowObject<ConfigItemHistory>(values, ch));
                }
            }
        }

        return rowObjects;
    }

}
