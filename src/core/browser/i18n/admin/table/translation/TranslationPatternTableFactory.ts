import { TranslationDetailsContext } from "../../context";
import { RoutingConfiguration } from "../../../../router";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import {
    KIXObjectType, TranslationPatternProperty, ContextMode, KIXObjectLoadingOptions, DataType
} from "../../../../../model";
import { TableFactory } from "../../../../table/TableFactory";
import { TranslationPatternTableContentProvider } from "./TranslationPatternTableContentProvider";


export class TranslationPatternTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.TRANSLATION_PATTERN;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: Array<number | string>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean
    ): ITable {
        tableConfiguration = this.setDefaultTableConfiguration(tableConfiguration, defaultRouting, defaultToggle);

        const table = new Table(tableKey, tableConfiguration);

        table.setContentProvider(new TranslationPatternTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId)
        );
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean
    ): TableConfiguration {
        const tableColumns = [
            this.getDefaultColumnConfiguration(TranslationPatternProperty.VALUE),
            this.getDefaultColumnConfiguration(TranslationPatternProperty.AVAILABLE_LANGUAGES)
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TRANSLATION_PATTERN, null, null, tableColumns, true, false, null, null,
                TableHeaderHeight.LARGE, TableRowHeight.LARGE
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                TranslationDetailsContext.CONTEXT_ID, KIXObjectType.TRANSLATION_PATTERN,
                ContextMode.DETAILS, TranslationPatternProperty.ID
            );
        }

        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case TranslationPatternProperty.VALUE:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 400, true, true, false,
                    DataType.STRING, true, null, null, false
                );
                break;
            case TranslationPatternProperty.AVAILABLE_LANGUAGES:
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
