/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, ContextMode, DataType, KIXObject } from "../../../model";
import { FAQArticleProperty, FAQVote } from "../../../model/kix/faq";
import { RoutingConfiguration } from "../../router";
import {
    TableConfiguration, ITable, Table,
    DefaultColumnConfiguration, IColumnConfiguration, IRow, IColumn
} from "../../table";
import { FAQArticleTableContentProvider } from "./FAQArticleTableContentProvider";
import { TableFactory } from "../../table/TableFactory";
import { FAQDetailsContext } from "../context/FAQDetailsContext";
import { BrowserUtil } from "../../BrowserUtil";

export class FAQArticleTableFactory extends TableFactory {

    public objectType: KIXObjectType = KIXObjectType.FAQ_ARTICLE;

    public createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): ITable {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration);
        const contentProvider = new FAQArticleTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId
        );

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
                this.getDefaultColumnConfiguration(FAQArticleProperty.NUMBER),
                this.getDefaultColumnConfiguration(FAQArticleProperty.TITLE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.LANGUAGE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.VOTES),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CATEGORY_ID)
            ];
        } else {
            tableColumns = [
                this.getDefaultColumnConfiguration(FAQArticleProperty.NUMBER),
                this.getDefaultColumnConfiguration(FAQArticleProperty.TITLE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.LANGUAGE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.VOTES),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CATEGORY_ID),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CHANGED),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CHANGED_BY)
            ];
        }

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(
                KIXObjectType.FAQ_ARTICLE, null, null, tableColumns, true, false
            );
            defaultRouting = true;
        } else if (!tableConfiguration.tableColumns) {
            tableConfiguration.tableColumns = tableColumns;
        }

        if (defaultRouting) {
            tableConfiguration.routingConfiguration = new RoutingConfiguration(
                FAQDetailsContext.CONTEXT_ID, KIXObjectType.FAQ_ARTICLE,
                ContextMode.DETAILS, FAQArticleProperty.ID
            );
        }

        tableConfiguration.objectType = KIXObjectType.FAQ_ARTICLE;
        return tableConfiguration;
    }

    // TODO: implementieren
    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        switch (property) {
            case FAQArticleProperty.NUMBER:
                return new DefaultColumnConfiguration(
                    FAQArticleProperty.NUMBER, true, false, true, false, 120, true, true
                );
            case FAQArticleProperty.TITLE:
                return new DefaultColumnConfiguration(
                    FAQArticleProperty.TITLE, true, false, true, false, 300, true, true, false, DataType.STRING, true,
                    undefined, undefined, false
                );
            case FAQArticleProperty.LANGUAGE:
                return new DefaultColumnConfiguration(
                    FAQArticleProperty.LANGUAGE, true, false, true, false, 125, true, true, true
                );
            case FAQArticleProperty.VOTES:
                return new DefaultColumnConfiguration(
                    FAQArticleProperty.VOTES, true, true, true, false, 120, true, true, true, DataType.STRING, false,
                    null, null, null, null, true
                );
            case FAQArticleProperty.CATEGORY_ID:
                return new DefaultColumnConfiguration(
                    FAQArticleProperty.CATEGORY_ID, true, false, true, false, 125, true, true, true
                );
            case FAQArticleProperty.CHANGED:
                return new DefaultColumnConfiguration(
                    FAQArticleProperty.CHANGED, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                );
            case FAQArticleProperty.CHANGED_BY:
                return new DefaultColumnConfiguration(
                    FAQArticleProperty.CHANGED_BY, true, false, true, false, 150, true, true
                );
            default:
                return super.getDefaultColumnConfiguration(property);
        }
    }

    public getColumnFilterValues<T extends KIXObject>(
        rows: IRow[], column: IColumn
    ): Array<[T, number]> {
        let values: Array<[T, number]> = [];
        if (column.getColumnId() === FAQArticleProperty.VOTES) {
            rows.forEach((r) => {
                const cell = r.getCell(column.getColumnId());
                if (cell) {
                    let cellValues = [];
                    const cellValue = cell.getValue();
                    if (Array.isArray(cellValue.objectValue)) {
                        cellValues = cellValue.objectValue;
                    }

                    const rating = BrowserUtil.calculateAverage(cellValues.map((cv: FAQVote) => cv.Rating));
                    const vote = new FAQVote();
                    vote.ID = rating;
                    vote.Rating = rating;

                    const existingValue = values.find((ev) => (ev[0] as any).Rating === rating);
                    if (existingValue) {
                        existingValue[1] = existingValue[1] + 1;
                    } else {
                        values.push([vote as any, 1]);
                    }
                }
            });
        } else {
            values = TableFactory.getColumnFilterValues(rows, column);
        }

        return values;
    }

}
