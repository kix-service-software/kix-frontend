import { TicketPriorityDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, TicketPriorityProperty, DataType, ContextMode } from "../../../../../model";
import { TicketPriorityTableContentProvider } from "./TicketPriorityTableContentProvider";

export class TicketPriorityTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TicketPriorityTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(TicketPriorityProperty.NAME, true, false, true, true, 200, true, true),
            new DefaultColumnConfiguration(TicketPriorityProperty.ID, false, true, false, true, 41, false),
            new DefaultColumnConfiguration(TicketPriorityProperty.COMMENT, true, false, true, true, 350, true, true),
            new DefaultColumnConfiguration(
                TicketPriorityProperty.VALID_ID, true, false, true, true, 150, true, true, true
            ),
            new DefaultColumnConfiguration(
                TicketPriorityProperty.CHANGE_TIME, true, false, true, true, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(TicketPriorityProperty.CHANGE_BY, true, false, true, true, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TICKET_PRIORITY, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, TicketPriorityDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_PRIORITY,
                ContextMode.DETAILS, TicketPriorityProperty.ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
