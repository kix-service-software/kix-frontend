/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight
} from "../../table";
import { KIXObjectType, DataType } from "../../../model";
import { TableFactory } from "../../table/TableFactory";
import { JobFilterTableContentProvider } from "./JobFilterTableContentProvider";
import { JobFilterTableProperty } from "./JobFilterTableProperty";

export class JobFilterTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.JOB_FILTER;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new JobFilterTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(null, null, null,
                JobFilterTableProperty.FIELD, true, false, true, false, 200, true, true,
                false, DataType.STRING, true, null, 'Translatable#Field', false
            ),
            new DefaultColumnConfiguration(null, null, null,
                JobFilterTableProperty.VALUE, true, false, true, false, 500, true, true,
                false, DataType.STRING, true, 'label-list-cell-content', 'Translatable#Value', false
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.JOB_FILTER, null, null, tableColumns, [], false, false, null, null,
                TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }
}
