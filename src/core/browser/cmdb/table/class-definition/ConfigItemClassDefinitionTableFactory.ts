import { KIXObjectType, DataType, ConfigItemClassDefinitionProperty } from "../../../../model";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, ToggleOptions, IColumnConfiguration
} from "../../../table";
import { ConfigItemClassDefinitionTableContentProvider } from "./ConfigItemClassDefinitionTableContentProvider";
import { TableFactory } from "../../../table/TableFactory";

export class ConfigItemClassDefinitionTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new ConfigItemClassDefinitionTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                ConfigItemClassDefinitionProperty.VERSION, true, false, true, true, 100, true, true
            ),
            new DefaultColumnConfiguration(
                ConfigItemClassDefinitionProperty.CREATE_TIME, true, false, true, true, 150,
                true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                ConfigItemClassDefinitionProperty.CREATE_BY, true, false, true, true, 150, true, true
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.CONFIG_ITEM_CLASS_DEFINITION, null, null, tableColumns, null, false, true,
                new ToggleOptions(
                    'config-item-class-definition', 'definition', [], true
                ), null,
                TableHeaderHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            //
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
