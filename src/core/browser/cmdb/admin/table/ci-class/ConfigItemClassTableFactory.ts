import {
    KIXObjectType, DataType, ConfigItemClassProperty, ContextMode
} from "../../../../../model";
import { RoutingConfiguration } from "../../../../router";
import { ConfigItemClassDetailsContext } from "../../context";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { ConfigItemClassTableContentProvider } from "./ConfigItemClassTableContentProvider";

export class ConfigItemClassTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new ConfigItemClassTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(ConfigItemClassProperty.NAME, true, false, true, true, 200, true, true),
            new DefaultColumnConfiguration(ConfigItemClassProperty.ID, false, true, false, true, 41, false),
            new DefaultColumnConfiguration(
                ConfigItemClassProperty.COMMENT, true, false, true, true, 350, true, true, false, DataType.STRING
            ),
            new DefaultColumnConfiguration(
                ConfigItemClassProperty.VALID_ID, true, false, true, true, 150, true, true, true
            ),
            new DefaultColumnConfiguration(
                ConfigItemClassProperty.CHANGE_TIME, true, false, true, true, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(ConfigItemClassProperty.CHANGE_BY, true, false, true, true, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONFIG_ITEM_CLASS, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, ConfigItemClassDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.DETAILS, ConfigItemClassProperty.ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
