import {
    KIXObjectType, DataType, ConfigItemClassProperty, ContextMode, KIXObjectProperty
} from "../../../../../model";
import { RoutingConfiguration } from "../../../../router";
import { ConfigItemClassDetailsContext } from "../../context";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { ConfigItemClassTableContentProvider } from "./ConfigItemClassTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";

export class ConfigItemClassTableFactory extends TableFactory {

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
            this.getDefaultColumnConfiguration(ConfigItemClassProperty.NAME),
            this.getDefaultColumnConfiguration('ICON'),
            this.getDefaultColumnConfiguration(ConfigItemClassProperty.COMMENT),
            this.getDefaultColumnConfiguration(KIXObjectProperty.VALID_ID),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONFIG_ITEM_CLASS, null, undefined, tableColumns, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                ConfigItemClassDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM_CLASS,
                ContextMode.DETAILS, ConfigItemClassProperty.ID
            );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case ConfigItemClassProperty.NAME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
