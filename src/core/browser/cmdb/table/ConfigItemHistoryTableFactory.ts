import { KIXObjectType, DataType, ConfigItemHistoryProperty } from "../../../model";
import {
    ITableFactory, ITable, TableConfiguration, Table, DefaultColumnConfiguration, TableHeaderHeight
} from "../../table";
import { ConfigItemHistoryContentProvider } from "./ConfigItemHistoryContentProvider";

export class ConfigItemHistoryTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_HISTORY;

    public createTable(
        tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>, contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableConfiguration);

        table.setContentProvider(new ConfigItemHistoryContentProvider(table, null, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(ConfigItemHistoryProperty.HISTORY_TYPE, true, false, true, true, 200),
            new DefaultColumnConfiguration(ConfigItemHistoryProperty.COMMENT, true, false, true, true, 550),
            new DefaultColumnConfiguration(ConfigItemHistoryProperty.CREATE_BY, true, false, true, true, 300),
            new DefaultColumnConfiguration(
                ConfigItemHistoryProperty.CREATE_TIME, true, false, true, true, 150, true, false, false,
                DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                ConfigItemHistoryProperty.VERSION_ID, true, true, false, false, 150,
                false, false, false, DataType.STRING, false, 'go-to-version-cell'
            ),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONFIG_ITEM_HISTORY, null, null, tableColumns, null, null, null, null, null,
                TableHeaderHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

}
