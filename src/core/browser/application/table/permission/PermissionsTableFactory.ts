import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableHeaderHeight, TableRowHeight, IColumnConfiguration
} from "../../../table";
import { KIXObjectType, PermissionProperty, DataType } from "../../../../model";
import { PermissionsTableContentProvider } from "./PermissionsTableContentProvider";
import { TableFactory } from "../../../table/TableFactory";

export class PermissionsTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION;

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.PERMISSION
            || objectType === KIXObjectType.PERMISSION_DEPENDING_OBJECTS
            || objectType === KIXObjectType.ROLE_PERMISSION;
    }

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new PermissionsTableContentProvider(objectType, table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                PermissionProperty.RoleID, true, false, true, false, 150, true, true, true,
                DataType.STRING, true, null, null, false
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
