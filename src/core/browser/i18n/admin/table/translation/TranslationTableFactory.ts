import { Translation, KIXObjectType, TranslationProperty, DataType, ContextMode } from "../../../../../model";
import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration, TableListenerConfiguration,
    StandardTable, TableColumnConfiguration, TableRowHeight, TableHeaderHeight, AbstractTableLayer
} from "../../../../standard-table";
import { IdService } from "../../../../IdService";
import { TranslationTableContentLayer } from "./TranslationTableContentLayer";
import { TranslationTableLabelLayer } from "./TranslationTableLabelLayer";
import { RoutingConfiguration } from "../../../../router";

export class TranslationTableFactory implements IStandardTableFactory<Translation> {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<Translation> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('i18n-translations-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(TranslationProperty.PATTERN, true, false, true, true, 400),
            new TableColumnConfiguration(TranslationProperty.LANGUAGES, true, false, true, true, 250)
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

        // if (defaultRouting) {
        //     tableConfiguration.routingConfiguration = new RoutingConfiguration(
        //         null, TranslationDetailsContext.CONTEXT_ID, KIXObjectType.TICKET_TYPE,
        //         ContextMode.DETAILS, TranslationProperty.ID
        //     );
        // }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer = new TranslationTableContentLayer([]);
            const labelLayer = new TranslationTableLabelLayer();

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
