import { RoutingConfiguration } from "../../../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, DataType, ContextMode, QueueProperty } from "../../../../../model";
import { TicketQueueTableContentProvider } from "./TicketQueueTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";

export class TicketQueueTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.QUEUE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TicketQueueTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(QueueProperty.NAME),
            this.getDefaultColumnConfiguration('ICON'),
            this.getDefaultColumnConfiguration(QueueProperty.FOLLOW_UP_ID),
            this.getDefaultColumnConfiguration(QueueProperty.UNLOCK_TIMEOUT),
            this.getDefaultColumnConfiguration(QueueProperty.SYSTEM_ADDRESS_ID),
            this.getDefaultColumnConfiguration(QueueProperty.COMMENT),
            this.getDefaultColumnConfiguration(QueueProperty.VALID_ID),
            this.getDefaultColumnConfiguration(QueueProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(QueueProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(QueueProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(QueueProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.QUEUE, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            // tableConfiguration.routingConfiguration = new RoutingConfiguration(
            //     null, TicketQueueDetailsContext.CONTEXT_ID, KIXObjectType.QUEUE,
            //     ContextMode.DETAILS, QueueProperty.ID
            // );
        }

        return tableConfiguration;
    }

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case QueueProperty.NAME:
            case QueueProperty.SYSTEM_ADDRESS_ID:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 200, true, true,
                    false, DataType.STRING, true, null, null, false
                );
                break;
            case 'ICON':
                config = new DefaultColumnConfiguration(
                    property, false, true, false, false, null, false, false, false, undefined, false
                );
                break;
            case QueueProperty.VALID_ID:
            case QueueProperty.FOLLOW_UP_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true, true);
                break;
            case QueueProperty.UNLOCK_TIMEOUT:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false, DataType.NUMBER
                );
                break;
            case QueueProperty.COMMENT:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 350, true, true);
                break;
            case QueueProperty.CHANGE_TIME:
            case QueueProperty.CREATE_TIME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
                );
                break;
            default:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true);
        }
        return config;
    }
}
