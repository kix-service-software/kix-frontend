import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, DataType, PermissionProperty } from "../../../../../model";
import { RolePermissionsTableContentProvider } from "./RolePermissionsTableContentProvider";

export class RolePermissionsTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.ROLE_PERMISSION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new RolePermissionsTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                PermissionProperty.TYPE_ID, true, false, true, false, 150, true, true, true,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                PermissionProperty.TARGET, true, false, true, false, 250, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                PermissionProperty.IS_REQUIRED, false, true, true, false, 85, true, true, true
            ),
            new DefaultColumnConfiguration(
                PermissionProperty.CREATE, false, false, true, false, 85, false, true, true, null, null, 'crud-cell'
            ),
            new DefaultColumnConfiguration(
                PermissionProperty.READ, false, false, true, false, 85, false, true, true, null, null, 'crud-cell'
            ),
            new DefaultColumnConfiguration(
                PermissionProperty.UPDATE, false, false, true, false, 85, false, true, true, null, null, 'crud-cell'
            ),
            new DefaultColumnConfiguration(
                PermissionProperty.DELETE, false, false, true, false, 85, false, true, true, null, null, 'crud-cell'
            ),
            new DefaultColumnConfiguration(
                PermissionProperty.DENY, false, false, true, false, 85, false, true, true, null, null, 'crud-cell'
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.USER, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
