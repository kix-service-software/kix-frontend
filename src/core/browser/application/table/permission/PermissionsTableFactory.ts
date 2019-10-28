/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, objectType
        );
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new PermissionsTableContentProvider(objectType, table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean,
        objectType: KIXObjectType = KIXObjectType.ROLE_PERMISSION
    ): TableConfiguration {
        let tableColumns = [];
        if (objectType === KIXObjectType.ROLE_PERMISSION) {
            tableColumns = [
                this.getDefaultColumnConfiguration(PermissionProperty.TARGET),
                this.getDefaultColumnConfiguration(PermissionProperty.CREATE),
                this.getDefaultColumnConfiguration(PermissionProperty.READ),
                this.getDefaultColumnConfiguration(PermissionProperty.UPDATE),
                this.getDefaultColumnConfiguration(PermissionProperty.DELETE),
                this.getDefaultColumnConfiguration(PermissionProperty.DENY)
            ];
        } else {
            tableColumns = [
                this.getDefaultColumnConfiguration(PermissionProperty.RoleID),
                this.getDefaultColumnConfiguration(PermissionProperty.CREATE),
                this.getDefaultColumnConfiguration(PermissionProperty.READ),
                this.getDefaultColumnConfiguration(PermissionProperty.UPDATE),
                this.getDefaultColumnConfiguration(PermissionProperty.DELETE),
                this.getDefaultColumnConfiguration(PermissionProperty.DENY)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.USER, null, null, tableColumns, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case PermissionProperty.RoleID:
            case PermissionProperty.TYPE_ID:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, true,
                    DataType.STRING, true, null, null, false
                );
                break;
            case 'ICON':
                config = new DefaultColumnConfiguration(
                    property, false, true, false, false, null, false, false, false, undefined, false
                );
                break;
            case PermissionProperty.TARGET:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 250, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            case PermissionProperty.IS_REQUIRED:
                config = new DefaultColumnConfiguration(
                    property, false, true, true, false, 85,
                    true, true, true, null, true, null, null, false, false
                );
                break;
            case PermissionProperty.CREATE:
            case PermissionProperty.READ:
            case PermissionProperty.UPDATE:
            case PermissionProperty.DELETE:
            case PermissionProperty.DENY:
                config = new DefaultColumnConfiguration(
                    property, false, false, true, false, 85,
                    false, true, true, null, null, 'crud-cell', null, false, false
                );
                break;
            case PermissionProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 350, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            case PermissionProperty.CHANGE_TIME:
            case PermissionProperty.CREATE_TIME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
