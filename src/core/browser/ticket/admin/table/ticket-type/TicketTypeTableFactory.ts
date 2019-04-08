import { TicketTypeDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, TicketTypeProperty, DataType, ContextMode } from "../../../../../model";
import { TicketTypeTableContentProvider } from "./TicketTypeTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";

export class TicketTypeTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TicketTypeTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                TicketTypeProperty.NAME, true, false, true, true, 200, true, true, false,
                DataType.STRING, true, null, null, false
            ),
            new DefaultColumnConfiguration(TicketTypeProperty.ID, false, true, false, true, 41, false),
            new DefaultColumnConfiguration(TicketTypeProperty.VALID_ID, true, false, true, true, 150, true, true, true),
            new DefaultColumnConfiguration(
                TicketTypeProperty.CREATE_TIME, true, false, true, true, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(TicketTypeProperty.CREATE_BY, true, false, true, true, 150, true, true),
            new DefaultColumnConfiguration(
                TicketTypeProperty.CHANGE_TIME, true, false, true, true, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(TicketTypeProperty.CHANGE_BY, true, false, true, true, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TICKET_TYPE, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, TicketTypeDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_TYPE,
                ContextMode.DETAILS, TicketTypeProperty.ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
