import { KIXObjectType, VersionProperty, DataType } from "../../../../model";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, TableRowHeight, ToggleOptions
} from "../../../table";
import { ConfigItemVersionContentProvider } from "./ConfigItemVersionContentProvider";

export class ConfigItemVersionTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_VERSION;

    public createTable(
        tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>, contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableConfiguration);

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
            new DefaultColumnConfiguration(VersionProperty.CREATE_BY, true, false, true, true, 150),
            new DefaultColumnConfiguration(
                VersionProperty.CREATE_TIME, true, false, true, true, 150, true, false, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(VersionProperty.CURRENT, true, false, true, false, 150, false)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONFIG_ITEM_VERSION, null, null, tableColumns, null, true, true, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            tableConfiguration.displayLimit = null;
            defaultToggle = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('config-item-version-details', 'version', [
                'config-item-version-maximize-action', 'config-item-print-action'
            ], true);
        }

        return tableConfiguration;
    }

}
