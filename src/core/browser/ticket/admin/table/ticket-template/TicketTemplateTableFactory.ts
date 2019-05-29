import {
    ITable, TableConfiguration, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { KIXObjectType, TicketTemplateProperty, DataType } from "../../../../../model";
import { TicketTemplateTableContentProvider } from "./TicketTemplateTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";

export class TicketTemplateTableFactory extends TableFactory {


    public objectType: KIXObjectType = KIXObjectType.TICKET_TEMPLATE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);
        table.setContentProvider(new TicketTemplateTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(TicketTemplateProperty.NAME),
            this.getDefaultColumnConfiguration('ICON'),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.TYPE_ID),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.CHANNEL_ID),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.COMMENT),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.VALID_ID),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.CREATE_TIME),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.CREATE_BY),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.CHANGE_TIME),
            this.getDefaultColumnConfiguration(TicketTemplateProperty.CHANGE_BY)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TICKET_TEMPLATE, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            // tableConfiguration.routingConfiguration = new RoutingConfiguration(
            //     TicketTemplateDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_TEMPLATE,
            //     ContextMode.DETAILS, TicketTemplateProperty.ID
            // );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case TicketTemplateProperty.NAME:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 200, true, true);
                break;
            case 'ICON':
                config = new DefaultColumnConfiguration(
                    property, false, true, false, false, null, false, false, false, undefined, false
                );
                break;
            case TicketTemplateProperty.TYPE_ID:
            case TicketTemplateProperty.CHANNEL_ID:
            case TicketTemplateProperty.VALID_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true, true);
                break;
            case TicketTemplateProperty.COMMENT:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 350, true, true);
                break;
            case TicketTemplateProperty.CHANGE_TIME:
            case TicketTemplateProperty.CREATE_TIME:
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
