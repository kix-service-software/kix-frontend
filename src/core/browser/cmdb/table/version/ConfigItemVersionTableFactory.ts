/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, VersionProperty, DataType } from "../../../../model";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, TableRowHeight, ToggleOptions, IColumnConfiguration
} from "../../../table";
import { ConfigItemVersionContentProvider } from "./ConfigItemVersionContentProvider";
import { TableFactory } from "../../../table/TableFactory";

export class ConfigItemVersionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        const contentProvider = new ConfigItemVersionContentProvider(table, null, null, contextId);

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(VersionProperty.COUNT_NUMBER, true, false, true, true, 120),
            new DefaultColumnConfiguration(
                VersionProperty.CREATE_TIME, true, false, true, true, 150, true, false, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(VersionProperty.CREATE_BY, true, false, true, true, 200),
            new DefaultColumnConfiguration(VersionProperty.BASED_ON_CLASS_VERSION, true, false, true, false, 300, false)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONFIG_ITEM_VERSION, null, undefined, tableColumns, true, true, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultToggle = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('config-item-version-details', 'version', [
                'config-item-version-maximize-action'
            ], true);
        }

        return tableConfiguration;
    }

}
