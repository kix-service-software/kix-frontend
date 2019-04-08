import { RoutingConfiguration } from "../../../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, DataType, ContextMode, UserProperty, KIXObjectLoadingOptions } from "../../../../../model";
import { UserDetailsContext } from "../../context";
import { UserTableContentProvider } from "./UserTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";

export class UserTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.USER;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(
            new UserTableContentProvider(
                table, objectIds,
                new KIXObjectLoadingOptions(null, null, null, null, null, [UserProperty.PREFERENCES]),
                contextId
            )
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                UserProperty.USER_LOGIN, true, false, true, false, 250, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                UserProperty.USER_LASTNAME, true, false, true, false, 250, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                UserProperty.USER_FIRSTNAME, true, false, true, false, 250, true, true
            ),
            new DefaultColumnConfiguration(
                UserProperty.USER_EMAIL, true, false, true, false, 200, true, true
            ),
            new DefaultColumnConfiguration(
                UserProperty.USER_PHONE, true, false, true, false, 200, true, true
            ),
            new DefaultColumnConfiguration(
                UserProperty.USER_MOBILE, true, false, true, false, 200, true, true
            ),
            new DefaultColumnConfiguration(
                UserProperty.LAST_LOGIN, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(UserProperty.VALID_ID, true, false, true, false, 100, true, true, true),
            new DefaultColumnConfiguration(
                UserProperty.CREATE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(UserProperty.CREATE_BY, true, false, true, true, 150, true, true),
            new DefaultColumnConfiguration(
                UserProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(UserProperty.CHANGE_BY, true, false, true, false, 150, true, true)
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

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, UserDetailsContext.CONTEXT_ID, KIXObjectType.USER,
                ContextMode.DETAILS, UserProperty.USER_ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
