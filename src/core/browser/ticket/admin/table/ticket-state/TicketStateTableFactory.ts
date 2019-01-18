import { KIXObjectType, TicketStateProperty, DataType, ContextMode, TicketState } from "../../../../../model";
import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration, TableListenerConfiguration,
    StandardTable, TableColumnConfiguration, TableRowHeight, TableHeaderHeight, AbstractTableLayer
} from "../../../../standard-table";
import { IdService } from "../../../../IdService";
import { TicketStateTableContentLayer } from "./TicketStateTableContentLayer";
import { TicketStateTableLabelLayer } from "./TicketStateTableLabelLayer";
import { RoutingConfiguration } from "../../../../router";
import { TicketStateDetailsContext } from "../../context";

export class TicketStateTableFactory implements IStandardTableFactory<TicketState> {


    public objectType: KIXObjectType = KIXObjectType.TICKET_STATE;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<TicketState> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('ticket-states-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(TicketStateProperty.NAME, true, false, true, true, 200, true),
            new TableColumnConfiguration('ICON', false, true, false, true, 41, false),
            new TableColumnConfiguration(TicketStateProperty.TYPE_NAME, true, false, true, true, 150, true),
            new TableColumnConfiguration(TicketStateProperty.COMMENT, true, false, true, true, 350, true),
            new TableColumnConfiguration(TicketStateProperty.VALID_ID, true, false, true, true, 150, true),
            new TableColumnConfiguration(
                TicketStateProperty.CHANGE_TIME, true, false, true, true, 150, true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(TicketStateProperty.CHANGE_BY, true, false, true, true, 150, true)
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
                null, TicketStateDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_STATE,
                ContextMode.DETAILS, TicketStateProperty.ID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new TicketStateTableContentLayer([]);
            const labelLayer = new TicketStateTableLabelLayer();

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
