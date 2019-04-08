import { KIXObjectType, TextModuleProperty } from "../../model";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, IColumnConfiguration
} from "../table";
import { TextModulesTableContentProvider } from "./TextModulesTableContentProvider";
import { TableFactory } from "../table/TableFactory";

export class TextModulesTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TEXT_MODULE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TextModulesTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(TextModuleProperty.NAME, true, false, true, true, 200, true, true),
            new DefaultColumnConfiguration(TextModuleProperty.LANGUAGE, true, false, true, true, 200, true, true, true),
            new DefaultColumnConfiguration(TextModuleProperty.CATEGORY, true, false, true, true, 200, true, true, true),
            new DefaultColumnConfiguration(TextModuleProperty.KEYWORDS, true, false, true, true, 250, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TEXT_MODULE, null, null, tableColumns, null, false, false, null, null,
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
