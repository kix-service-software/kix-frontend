import { RoutingConfiguration } from "../../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../table";
import { KIXObjectType, DataType } from "../../../../model";
import { SystemAddressTableContentProvider } from "./SystemAddressTableContentProvider";
import { SystemAddressProperty } from "../../../../model/kix/systemaddress";
import { TableFactory } from "../../../table/TableFactory";

export class SystemAddressTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.SYSTEM_ADDRESS;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new SystemAddressTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                SystemAddressProperty.NAME, true, false, true, false, 300, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                SystemAddressProperty.CREATE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(SystemAddressProperty.CREATE_BY, true, false, true, false, 150, true, true),
            new DefaultColumnConfiguration(
                SystemAddressProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(SystemAddressProperty.CHANGE_BY, true, false, true, false, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.SYSTEM_ADDRESS, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            // ToDo
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
