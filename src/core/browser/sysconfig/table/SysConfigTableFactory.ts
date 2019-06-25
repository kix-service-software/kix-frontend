import { RoutingConfiguration } from "../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../table";
import {
    KIXObjectType, DataType, KIXObjectLoadingOptions, KIXObjectProperty, SysConfigOptionDefinitionProperty
} from "../../../model";
import { TableFactory } from "../../table/TableFactory";
import { SysConfigTableContentProvider } from "./SysConfigTableContentProvider";

export class SysConfigTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.SYS_CONFIG_OPTION_DEFINITION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        let loadingOptions = null;
        if (tableConfiguration.filter && tableConfiguration.filter.length) {
            loadingOptions = new KIXObjectLoadingOptions(null, tableConfiguration.filter);
        }

        table.setContentProvider(new SysConfigTableContentProvider(
            table, objectIds, loadingOptions, contextId
        ));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                SysConfigOptionDefinitionProperty.NAME, true, false, true, false, 400, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                SysConfigOptionDefinitionProperty.IS_MODIFIED, true, false, false, false, 100, true, true, true
            ),
            new DefaultColumnConfiguration(
                KIXObjectProperty.VALID_ID, true, false, true, false, 100, true, true, true
            ),
            new DefaultColumnConfiguration(
                SysConfigOptionDefinitionProperty.VALUE, true, false, true, false, 300, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                KIXObjectProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(KIXObjectProperty.CHANGE_BY, true, false, true, false, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        // tslint:disable-next-line:no-empty
        if (defaultRouting) {
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
