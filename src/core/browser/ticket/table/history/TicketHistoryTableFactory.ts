import {
    IStandardTableFactory, TableConfiguration, StandardTable, TableListenerConfiguration,
    TableColumnConfiguration, AbstractTableLayer, TableLayerConfiguration, TableRowHeight, TableHeaderHeight
} from "../../../standard-table";
import {
    KIXObjectType, TicketHistory, TicketHistoryProperty, DataType
} from "../../../../model";
import { IdService } from "../../../IdService";
import { TicketHistoryTableLabelLayer } from "./TicketHistoryTableLabelLayer";
import { TicketHistoryTableContentLayer } from "./TicketHistoryTableContentLayer";

export class TicketHistoryTableFactory implements IStandardTableFactory<TicketHistory> {

    public objectType: KIXObjectType = KIXObjectType.TICKET_HISTORY;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<TicketHistory> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('ticket-history-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(TicketHistoryProperty.HISTORY_TYPE, true, false, true, true, 200, true),
            new TableColumnConfiguration(TicketHistoryProperty.NAME, true, false, true, true, 550, true),
            new TableColumnConfiguration(TicketHistoryProperty.CREATE_BY, true, false, true, true, 300, true),
            new TableColumnConfiguration(
                TicketHistoryProperty.CREATE_TIME, true, false, true, true, 150, true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(
                TicketHistoryProperty.ARTICLE_ID, true, true, false, false, 150, false, true
            ),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.rowHeight = TableRowHeight.SMALL;
            tableConfiguration.headerHeight = TableHeaderHeight.SMALL;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new TicketHistoryTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new TicketHistoryTableLabelLayer();

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
