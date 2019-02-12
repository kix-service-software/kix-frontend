import {
    IStandardTableFactory, TableConfiguration, StandardTable, TableListenerConfiguration,
    TableColumnConfiguration, AbstractTableLayer, TableLayerConfiguration
} from "../../standard-table";
import { KIXObjectType, ContextMode, DataType } from "../../../model";
import { IdService } from "../../IdService";
import { FAQArticleProperty, FAQArticle } from "../../../model/kix/faq";
import { FAQTableContentLayer } from "./FAQTableContentLayer";
import { FAQTableLabelLayer } from "./FAQTableLabelLayer";
import { RoutingConfiguration } from "../../router";
import { FAQDetailsContext } from "../context";

export class FAQTableFactory implements IStandardTableFactory<FAQArticle> {

    public objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public createTable(
        tableConfiguration?: TableConfiguration,
        layerConfiguration?: TableLayerConfiguration,
        listenerConfiguration?: TableListenerConfiguration,
        defaultRouting?: boolean,
        defaultToggle?: boolean,
        short?: boolean
    ): StandardTable<FAQArticle> {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );
        layerConfiguration = this.setDefaultLayerConfiguration(layerConfiguration, tableConfiguration, defaultToggle);
        listenerConfiguration = this.setDefaultListenerConfiguration(listenerConfiguration);

        return new StandardTable(
            IdService.generateDateBasedId('faq-table'), tableConfiguration, layerConfiguration, listenerConfiguration
        );
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;

        if (short) {
            tableColumns = [
                new TableColumnConfiguration(FAQArticleProperty.NUMBER, true, false, true, true, 120),
                new TableColumnConfiguration(FAQArticleProperty.TITLE, true, false, true, true, 300),
                new TableColumnConfiguration(FAQArticleProperty.LANGUAGE, true, false, true, true, 125),
                new TableColumnConfiguration(FAQArticleProperty.VISIBILITY, true, true, true, true, 125),
                new TableColumnConfiguration(FAQArticleProperty.VOTES, true, true, false, true, 120),
                new TableColumnConfiguration(FAQArticleProperty.CATEGORY_ID, true, false, true, true, 125)
            ];
        } else {
            tableColumns = [
                new TableColumnConfiguration(FAQArticleProperty.NUMBER, true, false, true, true, 120),
                new TableColumnConfiguration(FAQArticleProperty.TITLE, true, false, true, true, 300),
                new TableColumnConfiguration(FAQArticleProperty.LANGUAGE, true, false, true, true, 125),
                new TableColumnConfiguration(FAQArticleProperty.VISIBILITY, true, true, true, true, 125),
                new TableColumnConfiguration(FAQArticleProperty.VOTES, true, true, false, true, 120),
                new TableColumnConfiguration(FAQArticleProperty.CATEGORY_ID, true, false, true, true, 125),
                new TableColumnConfiguration(
                    FAQArticleProperty.CHANGED, true, false, true, true, 125, true, false, DataType.DATE_TIME
                ),
                new TableColumnConfiguration(FAQArticleProperty.CHANGED_BY, true, false, true, true, 150)
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
                null, FAQDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE,
                ContextMode.DETAILS, FAQArticleProperty.ID
            );
        }

        return tableConfiguration;
    }

    private setDefaultLayerConfiguration(
        layerConfiguration: TableLayerConfiguration, tableConfiguration: TableConfiguration, defaultToggle?: boolean
    ): TableLayerConfiguration {

        if (!layerConfiguration) {
            const contentLayer: AbstractTableLayer = new FAQTableContentLayer(
                [], tableConfiguration.filter, tableConfiguration.sortOrder, tableConfiguration.limit
            );
            const labelLayer = new FAQTableLabelLayer();

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
