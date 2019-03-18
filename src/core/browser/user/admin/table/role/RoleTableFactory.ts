import { RoutingConfiguration } from "../../../../router";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, RoleProperty, DataType, ContextMode } from "../../../../../model";
import { RoleTableContentProvider } from "./RoleTableContentProvider";

export class RoleTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.ROLE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new RoleTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                RoleProperty.NAME, true, false, true, false, 300, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(
                RoleProperty.COMMENT, true, false, true, false, 400, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(RoleProperty.VALID_ID, true, false, true, false, 150, true, true, true),
            new DefaultColumnConfiguration(
                RoleProperty.CREATE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(RoleProperty.CREATE_BY, true, false, true, false, 150, true, true),
            new DefaultColumnConfiguration(
                RoleProperty.CHANGE_TIME, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(RoleProperty.CHANGE_BY, true, false, true, false, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.ROLE, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        // if (defaultRouting) {
        //     tableConfiguration.routingConfiguration = new RoutingConfiguration(
        //         null, RoleDetailsContext.CONTEXT_ID, KIXObjectType.ROLE,
        //         ContextMode.DETAILS, RoleProperty.ID
        //     );
        // }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
