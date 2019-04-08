import { KIXObjectType, ContextMode, DataType } from "../../../model";
import { FAQArticleProperty } from "../../../model/kix/faq";
import { RoutingConfiguration } from "../../router";
import { FAQDetailsContext } from "../context";
import {
    TableConfiguration, ITable, Table,
    DefaultColumnConfiguration, IColumnConfiguration
} from "../../table";
import { FAQArticleTableContentProvider } from "./FAQArticleTableContentProvider";
import { TableFactory } from "../../table/TableFactory";

export class FAQArticleTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean,
        short?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration);
        const contentProvider = new FAQArticleTableContentProvider(table, objectIds, null, contextId);

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        let tableColumns;

        if (short) {
            tableColumns = [
                new DefaultColumnConfiguration(FAQArticleProperty.NUMBER, true, false, true, false, 120, true, true),
                new DefaultColumnConfiguration(FAQArticleProperty.TITLE, true, false, true, false, 300, true, true),
                new DefaultColumnConfiguration(FAQArticleProperty.LANGUAGE, true, false, true, false, 125, true, true),
                new DefaultColumnConfiguration(
                    FAQArticleProperty.VISIBILITY, true, true, true, false, 125,
                    true, true, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    FAQArticleProperty.VOTES, true, true, true, false, 120, true, true, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    FAQArticleProperty.CATEGORY_ID, true, false, true, false, 125, true, true
                ),
            ];
        } else {
            tableColumns = [
                new DefaultColumnConfiguration(FAQArticleProperty.NUMBER, true, false, true, false, 120, true, true),
                new DefaultColumnConfiguration(FAQArticleProperty.TITLE, true, false, true, false, 300, true, true),
                new DefaultColumnConfiguration(FAQArticleProperty.LANGUAGE, true, false, true, false, 125, true, true),
                new DefaultColumnConfiguration(
                    FAQArticleProperty.VISIBILITY, true, true, true, false, 125,
                    true, true, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    FAQArticleProperty.VOTES, true, true, true, false, 120, true, true, false, DataType.STRING, false
                ),
                new DefaultColumnConfiguration(
                    FAQArticleProperty.CATEGORY_ID, true, false, true, false, 125, true, true
                ),
                new DefaultColumnConfiguration(
                    FAQArticleProperty.CHANGED, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                ),
                new DefaultColumnConfiguration(FAQArticleProperty.CHANGED_BY, true, false, true, false, 150, true, true)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(KIXObjectType.FAQ_ARTICLE);
            tableConfiguration.tableColumns = tableColumns;
            tableConfiguration.enableSelection = true;
            tableConfiguration.toggle = false;
            tableConfiguration.displayLimit = null;
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                null, FAQDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE,
                ContextMode.DETAILS, FAQArticleProperty.ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.FAQ_ARTICLE;
        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }

}
