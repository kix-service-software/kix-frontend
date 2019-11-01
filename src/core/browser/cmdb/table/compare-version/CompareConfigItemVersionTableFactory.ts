/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, DataType } from "../../../../model";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, TableRowHeight, IColumnConfiguration
} from "../../../table";
import { CompareConfigItemVersionTableContentProvider } from "./CompareConfigItemVersionTableContentProvider";
import { TableFactory } from "../../../table/TableFactory";

export class CompareConfigItemVersionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION_COMPARE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        const contentProvider = new CompareConfigItemVersionTableContentProvider(table, null, null, contextId);

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const columns = tableConfiguration
            ? tableConfiguration.tableColumns
            : [new DefaultColumnConfiguration(null, null, null,
                'CONFIG_ITEM_ATTRIBUTE', true, false, true, false, 250, false, false, false, DataType.STRING, true,
                'multiline-cell'
            )];

        tableConfiguration = new TableConfiguration(null, null, null,
            KIXObjectType.CONFIG_ITEM_VERSION_COMPARE, null, null, columns, [], false, false, null, null,
            TableHeaderHeight.LARGE, TableRowHeight.LARGE, null, null, true
        );
        tableConfiguration.displayLimit = 18;

        return tableConfiguration;
    }
}
