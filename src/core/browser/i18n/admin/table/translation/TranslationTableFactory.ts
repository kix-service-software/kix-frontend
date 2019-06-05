import { TranslationDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import {
    KIXObjectType, TranslationProperty, ContextMode, KIXObjectLoadingOptions, DataType
} from "../../../../../model";
import { TranslationTableContentProvider } from "./TranslationTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";


export class TranslationTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {
        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        const loadingOptions = new KIXObjectLoadingOptions(
            null, tableConfiguration.filter, tableConfiguration.sortOrder, null, [TranslationProperty.LANGUAGES]
        );

        table.setContentProvider(new TranslationTableContentProvider(table, objectIds, loadingOptions, contextId));
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(TranslationProperty.PATTERN),
            this.getDefaultColumnConfiguration(TranslationProperty.LANGUAGES)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TRANSLATION, null, null, tableColumns, null, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                TranslationDetailsContext.CONTEXT_ID, KIXObjectType.TRANSLATION,
                ContextMode.DETAILS, TranslationProperty.ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case TranslationProperty.PATTERN:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 400, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            case TranslationProperty.LANGUAGES:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 250, true, true, true,
                    DataType.STRING, true, 'label-list-cell-content'
                );
                break;
            default:
                config = super.getDefaultColumnConfiguration(property);
        }
        return config;
    }
}
