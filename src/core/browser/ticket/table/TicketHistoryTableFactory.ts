import {
    KIXObjectType, TicketHistoryProperty, DataType
} from "../../../model";
import {
    ITableFactory, ITable, TableConfiguration, Table, DefaultColumnConfiguration,
    TableHeaderHeight, IColumnConfiguration
} from "../../table";
import { TicketHistoryContentProvider } from "./TicketHistoryContentProvider";

export class TicketHistoryTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.TICKET_HISTORY;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TicketHistoryContentProvider(table, null, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(TicketHistoryProperty.HISTORY_TYPE, true, false, true, true, 200),
            new DefaultColumnConfiguration(TicketHistoryProperty.NAME, true, false, true, true, 550),
            new DefaultColumnConfiguration(TicketHistoryProperty.CREATE_BY, true, false, true, true, 300),
            new DefaultColumnConfiguration(
                TicketHistoryProperty.CREATE_TIME, true, false, true, true, 150, true, false, false, DataType.DATE_TIME
            ),
            new DefaultColumnConfiguration(
                TicketHistoryProperty.ARTICLE_ID, true, true, false, false, 150,
                false, false, false, DataType.STRING, true, 'go-to-article-cell'
            ),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TICKET_HISTORY, null, null, tableColumns, null, null, null, null, null,
                TableHeaderHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }

}
