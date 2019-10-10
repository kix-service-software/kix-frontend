/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, TranslationLanguageProperty } from "../../../../../model";
import {
    TableConfiguration, ITable, Table, DefaultColumnConfiguration,
    TableRowHeight, TableHeaderHeight, IColumnConfiguration
} from "../../../../table";
import { TranslationLanguageTableContentProvider } from "./TranslationLanguageTableContentProvider";
import { TableFactory } from "../../../../table/TableFactory";

export class TranslationLanguageTableFactory extends TableFactory {

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
            new DefaultColumnConfiguration(
                TranslationLanguageProperty.VALUE, true, false, true, true, 400, true, true, false,
                null, true, null, null, false
            )
        ];

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.TRANSLATION_LANGUAGE, null, null, tableColumns, false, false, null, null,
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

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        return;
    }
}
