import { KIXObjectType, TranslationLanguage, TranslationLanguageProperty } from "../../../../../model";
import {
    IStandardTableFactory, TableConfiguration, TableLayerConfiguration, TableListenerConfiguration,
    StandardTable, TableColumnConfiguration, TableRowHeight, TableHeaderHeight
} from "../../../../standard-table";
import { IdService } from "../../../../IdService";
import { TranslationLanguageTableContentLayer } from "./TranslationLanguageTableContentLayer";
import { TranslationLanguageTableLabelLayer } from "./TranslationLanguageTableLabelLayer";

export class TranslationLanguageTableFactory implements IStandardTableFactory<TranslationLanguage> {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION_LANGUAGE;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<TranslationLanguage> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('i18n-translation-language-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(TranslationLanguageProperty.LANGUAGE, true, false, true, true, 150),
            new TableColumnConfiguration(TranslationLanguageProperty.VALUE, true, false, true, true, 400)
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

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer = new TranslationLanguageTableContentLayer([]);
            const labelLayer = new TranslationLanguageTableLabelLayer();

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
