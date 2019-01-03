import {
    IStandardTableFactory, TableConfiguration, StandardTable, TableListenerConfiguration,
    TableColumnConfiguration, AbstractTableLayer, TableLayerConfiguration, TableRowHeight, TableHeaderHeight
} from "../../standard-table";
import { KIXObjectType, DataType } from "../../../model";
import { IdService } from "../../IdService";
import { FAQArticle, FAQArticleHistoryProperty } from "../../../model/kix/faq";
import { FAQArticleHistoryTableContentLayer } from "./FAQArticleHistoryTableContentLayer";
import { FAQArticleHistoryTableLabelLayer } from "./FAQArticleHistoryTableLabelLayer";

export class FAQArticleHistoryTableFactory implements IStandardTableFactory<FAQArticle> {

    public objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE_HISTORY;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean
    ): StandardTable<FAQArticle> {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('faq-article-history-table'),
            tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new TableColumnConfiguration(FAQArticleHistoryProperty.NAME, true, false, true, true, 150),
            new TableColumnConfiguration(FAQArticleHistoryProperty.CREATED_BY, true, false, true, true, 150),
            new TableColumnConfiguration(
                FAQArticleHistoryProperty.CREATED, true, false, true, true, 150, true, false, DataType.DATE_TIME
            )
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
            const contentLayer: AbstractTableLayer = new FAQArticleHistoryTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new FAQArticleHistoryTableLabelLayer();

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
