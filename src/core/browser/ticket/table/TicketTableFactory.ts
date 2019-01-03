import {
    IStandardTableFactory, TableConfiguration, StandardTable, TableListenerConfiguration,
    TableColumnConfiguration, AbstractTableLayer, TableLayerConfiguration, ToggleOptions, TableToggleLayer
} from "../../standard-table";
import { KIXObjectType, Ticket, TicketProperty, ContextMode, DataType } from "../../../model";
import { IdService } from "../../IdService";
import { TicketTableLabelLayer } from "./TicketTableLabelLayer";
import { TicketTableContentLayer } from "./TicketTableContentLayer";
import { RoutingConfiguration } from "../../router";
import { TicketDetailsContext } from "../context";

export class TicketTableFactory implements IStandardTableFactory<Ticket> {

    public objectType: KIXObjectType = KIXObjectType.TICKET;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean,
        short?: boolean
    ): StandardTable<Ticket> {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('ticket-table'), tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;

        if (short) {
            tableColumns = [
                new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, true, 65),
                new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 135),
                new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 160),
                new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 80),
                new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                new TableColumnConfiguration(TicketProperty.OWNER_ID, true, false, true, true, 150),
                new TableColumnConfiguration(TicketProperty.CUSTOMER_ID, true, false, true, true, 150),
                new TableColumnConfiguration(
                    TicketProperty.CREATED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                )
            ];
        } else {
            tableColumns = [
                new TableColumnConfiguration(TicketProperty.PRIORITY_ID, false, true, false, true, 65),
                new TableColumnConfiguration(TicketProperty.UNSEEN, false, true, false, true, 41, false),
                new TableColumnConfiguration(TicketProperty.WATCHERS, false, true, false, true, 41, false),
                new TableColumnConfiguration(TicketProperty.TICKET_NUMBER, true, false, true, true, 135),
                new TableColumnConfiguration(TicketProperty.TITLE, true, false, true, true, 260),
                new TableColumnConfiguration(TicketProperty.STATE_ID, false, true, true, true, 80),
                new TableColumnConfiguration(TicketProperty.LOCK_ID, false, true, true, true, 41, false),
                new TableColumnConfiguration(TicketProperty.QUEUE_ID, true, false, true, true, 100),
                new TableColumnConfiguration(TicketProperty.RESPONSIBLE_ID, true, false, true, true, 150),
                new TableColumnConfiguration(TicketProperty.OWNER_ID, true, false, true, true, 150),
                new TableColumnConfiguration(TicketProperty.CUSTOMER_ID, true, false, true, true, 150),
                new TableColumnConfiguration(
                    TicketProperty.CHANGED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                ),
                new TableColumnConfiguration(
                    TicketProperty.AGE, true, false, true, true, 75, true, false, DataType.DATE_TIME
                )
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration();
            tableConfiguration.tableColumns = tableColumns;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, TicketDetailsContext.CONTEXT_ID, KIXObjectType.TICKET,
                ContextMode.DETAILS, TicketProperty.TICKET_ID
            );
        }
        if (defaultToggle) {
            tableConfiguration.toggle = true;
            tableConfiguration.toggleOptions = new ToggleOptions('ticket-article-details', 'article', [], true);
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new TicketTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new TicketTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer);
        }

        if (defaultToggle) {
            const listener = {
                rowToggled: () => { return; }
            };
            layerConfiguration.toggleLayer = new TableToggleLayer(listener, false);
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
