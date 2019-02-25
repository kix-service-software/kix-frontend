import { KIXObjectType, TranslationLanguageProperty } from "../../../../../model";
import {
    ITableFactory, TableConfiguration, ITable, Table, DefaultColumnConfiguration, TableRowHeight, TableHeaderHeight
} from "../../../../table";
import { TranslationLanguageTableContentProvider } from "./TranslationLanguageTableContentProvider";

export class TranslationLanguageTableFactory implements ITableFactory {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION_LANGUAGE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);
        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TranslationLanguageTableContentProvider(table, objectIds, null, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            new DefaultColumnConfiguration(
                TranslationLanguageProperty.LANGUAGE, true, false, true, true, 150, true, true, true
            ),
            new DefaultColumnConfiguration(TranslationLanguageProperty.VALUE, true, false, true, true, 400, true, true)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TRANSLATION_LANGUAGE, null, null, tableColumns, null, false, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            //
        }

        return tableConfiguration;
    }
}
