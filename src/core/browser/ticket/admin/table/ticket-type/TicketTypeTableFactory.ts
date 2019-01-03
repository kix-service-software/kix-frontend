import { TicketType, KIXObjectType, TicketTypeProperty, DataType, ContextMode } from "../../../../../model";
import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration, TableListenerConfiguration,
    StandardTable, TableColumnConfiguration, TableRowHeight, TableHeaderHeight, AbstractTableLayer
} from "../../../../standard-table";
import { IdService } from "../../../../IdService";
import { TicketTypeTableContentLayer } from "./TicketTypeTableContentLayer";
import { TicketTypeTableLabelLayer } from "./TicketTypeTableLabelLayer";
import { RoutingConfiguration } from "../../../../router";
import { TicketTypeDetailsContext } from "../../context";

export class TicketTypeTableFactory implements IStandardTableFactory<TicketType> {

    public objectType: KIXObjectType = KIXObjectType.TICKET_TYPE;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<TicketType> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('ticket-types-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(TicketTypeProperty.NAME, true, false, true, true, 200, true),
            new TableColumnConfiguration('ICON', false, true, false, true, 41, false),
            new TableColumnConfiguration(TicketTypeProperty.VALID_ID, true, false, true, true, 150, true),
            new TableColumnConfiguration(
                TicketTypeProperty.CREATE_TIME, true, false, true, true, 150, true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(TicketTypeProperty.CREATE_BY, true, false, true, true, 150, true),
            new TableColumnConfiguration(
                TicketTypeProperty.CHANGE_TIME, true, false, true, true, 150, true, false, DataType.DATE_TIME
            ),
            new TableColumnConfiguration(TicketTypeProperty.CHANGE_BY, true, false, true, true, 150, true)
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
                null, TicketTypeDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_TYPE,
                ContextMode.DETAILS, TicketTypeProperty.ID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new TicketTypeTableContentLayer([]);
            const labelLayer = new TicketTypeTableLabelLayer();

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
