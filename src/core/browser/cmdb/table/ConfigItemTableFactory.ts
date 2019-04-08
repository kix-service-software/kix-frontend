import { KIXObjectType, ContextMode, ConfigItemProperty, DataType } from "../../../model";
import { RoutingConfiguration } from "../../router";
import { ConfigItemDetailsContext } from "../context";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    ToggleOptions, TableRowHeight, IColumnConfiguration
} from "../../table";
import { ConfigItemTableContentProvider } from "./ConfigItemTableContentProvider";
import { TableFactory } from "../../table/TableFactory";

export class ConfigItemTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration, contextId);
        table.setContentProvider(new ConfigItemTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;

        if (short) {
            tableColumns = [
                new DefaultColumnConfiguration(ConfigItemProperty.NUMBER, true, false, true, false, 135, true, true),
                new DefaultColumnConfiguration(ConfigItemProperty.NAME, true, false, true, false, 300, true, true),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, false, true, false, true, 55,
                    true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CUR_INCI_STATE_ID, false, true, false, true, 55,
                    true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CLASS_ID, true, false, true, false, 200, true, true, true
                ),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CHANGE_TIME, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                ),
                new DefaultColumnConfiguration(ConfigItemProperty.CHANGE_BY, true, false, true, false, 150, true, true)
            ];
        } else {
            tableColumns = [
                new DefaultColumnConfiguration(ConfigItemProperty.NUMBER, true, false, true, false, 135, true, true),
                new DefaultColumnConfiguration(ConfigItemProperty.NAME, true, false, true, false, 300, true, true),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CUR_DEPL_STATE_ID, false, true, false, true, 55,
                    true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CUR_INCI_STATE_ID, false, true, false, true, 55,
                    true, true, true, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CLASS_ID, true, false, true, false, 200, true, true, true
                ),
                new DefaultColumnConfiguration(
                    ConfigItemProperty.CHANGE_TIME, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                ),
                new DefaultColumnConfiguration(ConfigItemProperty.CHANGE_BY, true, false, true, false, 150, true, true)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONFIG_ITEM, null, null, tableColumns,
                null, true, true, null, null, null, TableRowHeight.LARGE
            );
            defaultToggle = true;
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('config-item-version-details', 'configItem', [
                'config-item-version-maximize-action', 'config-item-print-action'
            ], false);
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, ConfigItemDetailsContext.CONTEXT_ID, KIXObjectType.CONFIG_ITEM,
                ContextMode.DETAILS, ConfigItemProperty.CONFIG_ITEM_ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.CONFIG_ITEM;
        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
