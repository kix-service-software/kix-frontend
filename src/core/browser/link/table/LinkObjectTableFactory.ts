import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration,
    TableListenerConfiguration, StandardTable, TableSortLayer, TableFilterLayer,
    AbstractTableLayer,
    TableColumnConfiguration,
    TableHeaderHeight,
    TableRowHeight
} from "../../standard-table";
import { KIXObjectType, LinkObject, LinkObjectProperty, SortOrder } from "../../../model";
import { IdService } from "../../IdService";
import { LinkObjectTableLabelLayer } from "./LinkObjectTableLabelLayer";
import { LinkObjectTableContentLayer } from "./LinkObjectTableContentLayer";

export class LinkObjectTableFactory implements IStandardTableFactory {

    public objectType: KIXObjectType = KIXObjectType.LINK_OBJECT;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<LinkObject> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('link-object-table'),
            tableConfiguration,
            layerConfiguration,
            listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(LinkObjectProperty.LINKED_OBJECT_TYPE, true, true, true, true, 200),
            new TableColumnConfiguration(LinkObjectProperty.LINKED_OBJECT_DISPLAY_ID, true, false, true, true, 200),
            new TableColumnConfiguration(LinkObjectProperty.TITLE, true, false, true, true, 500),
            new TableColumnConfiguration(LinkObjectProperty.LINKED_AS, true, false, true, true, 140),
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                null, 10, tableColumns, null, true, false, null,
                null, TableHeaderHeight.SMALL, TableRowHeight.SMALL
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new LinkObjectTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new LinkObjectTableLabelLayer();

            layerConfiguration = new TableLayerConfiguration(contentLayer, labelLayer,
                [new TableFilterLayer()], [new TableSortLayer()]
            );
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
