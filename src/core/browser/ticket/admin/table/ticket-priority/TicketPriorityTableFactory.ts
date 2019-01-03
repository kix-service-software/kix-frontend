import { KIXObjectType, DataType, TicketPriority, TicketPriorityProperty, ContextMode } from "../../../../../model";
import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration, TableListenerConfiguration,
    StandardTable, TableColumnConfiguration, TableRowHeight, TableHeaderHeight, AbstractTableLayer
} from "../../../../standard-table";
import { IdService } from "../../../../IdService";
import { TicketPriorityTableContentLayer } from "./TicketPriorityTableContentLayer";
import { TicketPriorityTableLabelLayer } from "./TicketPriorityTableLabelLayer";
import { TicketPriorityDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";

export class TicketPriorityTableFactory implements IStandardTableFactory<TicketPriority> {

    public objectType: KIXObjectType = KIXObjectType.TICKET_PRIORITY;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<TicketPriority> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('ticket-priorities-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(TicketPriorityProperty.NAME, true, false, true, true, 200, true),
            new TableColumnConfiguration('ICON', false, true, false, true, 41, false),
            new TableColumnConfiguration(TicketPriorityProperty.COMMENT, true, false, true, true, 350, true, false),
            new TableColumnConfiguration(TicketPriorityProperty.VALID_ID, true, false, true, true, 150, true),
            new TableColumnConfiguration(
                TicketPriorityProperty.CHANGE_TIME, true, false, true, true, 150, true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(TicketPriorityProperty.CHANGE_BY, true, false, true, true, 150, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.rowHeight = TableRowHeight.LARGE;
            tableConfiguration.headerHeight = TableHeaderHeight.LARGE;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.rowHeight = TableRowHeight.LARGE;
            tableConfiguration.headerHeight = TableHeaderHeight.LARGE;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, TicketPriorityDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_PRIORITY,
                ContextMode.DETAILS, TicketPriorityProperty.ID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new TicketPriorityTableContentLayer([]);
            const labelLayer = new TicketPriorityTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);
        }

        return layerConfiguration;
    }

    private setDefaultListenerConfiguration(
        listenerConfiguration: TableListenerConfiguration
    ): TableListenerConfiguration {

        if (!listenerConfiguration) {
            listenerConfiguration = new TableListenerConfiguration();
        }

        return listenerConfiguration;
    }
}
