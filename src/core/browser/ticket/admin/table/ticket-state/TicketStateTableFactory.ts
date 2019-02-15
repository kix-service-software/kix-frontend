import { TicketStateDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";
import {
    ITableFactory, ITable, TableConfiguration, Table, DefaultColumnConfiguration, TableRowHeight, TableHeaderHeight
} from "../../../../table";
import { KIXObjectType, TicketStateProperty, DataType, ContextMode } from "../../../../../model";
import { TicketStateTableContentProvider } from "./TicketStateTableContentProvider";

export class TicketStateTableFactory implements ITableFactory {


    public objectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    public createTable(
        tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableConfiguration);
        table.setContentProvider(new TicketStateTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(TicketStateProperty.NAME, true, false, true, true, 200, true, true),
            new DefaultColumnConfiguration(TicketStateProperty.ID, false, true, false, true, 41, false),
            new DefaultColumnConfiguration(
                TicketStateProperty.TYPE_NAME, true, false, true, true, 150, true, true, true
            ),
            new DefaultColumnConfiguration(TicketStateProperty.COMMENT, true, false, true, true, 350, true, true),
            new DefaultColumnConfiguration(
                TicketStateProperty.VALID_ID, true, false, true, true, 150, true, true, true
            ),
            new DefaultColumnConfiguration(
                TicketStateProperty.CHANGE_TIME, true, false, true, true, 150, true, true, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(TicketStateProperty.CHANGE_BY, true, false, true, true, 150, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TICKET_STATE, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, TicketStateDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_STATE,
                ContextMode.DETAILS, TicketStateProperty.ID
            );
        }

        return tableConfiguration;
    }
}
