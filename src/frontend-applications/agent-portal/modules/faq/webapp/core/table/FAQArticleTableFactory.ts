/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableFactory } from '../../../../table/webapp/core/factory/TableFactory';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { FAQArticleTableContentProvider } from '.';
import { FAQArticleProperty } from '../../../model/FAQArticleProperty';
import { RoutingConfiguration } from '../../../../../model/configuration/RoutingConfiguration';
import { FAQDetailsContext } from '../context/FAQDetailsContext';
import { ContextMode } from '../../../../../model/ContextMode';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { BrowserUtil } from '../../../../../modules/base-components/webapp/core/BrowserUtil';
import { FAQVote } from '../../../model/FAQVote';
import { SearchCache } from '../../../../search/model/SearchCache';
import { Column } from '../../../../table/model/Column';
import { Row } from '../../../../table/model/Row';
import { Table } from '../../../../table/model/Table';

export class FAQArticleTableFactory extends TableFactory {

    public objectType: KIXObjectType | string = KIXObjectType.FAQ_ARTICLE;

    public async createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectIds?: number[], contextId?: string,
        defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean, objectType?: KIXObjectType | string,
        objects?: KIXObject[]
    ): Promise<Table> {

        tableConfiguration = this.setDefaultTableConfiguration(
            tableConfiguration, defaultRouting, defaultToggle, short
        );

        const table = new Table(tableKey, tableConfiguration);
        const contentProvider = new FAQArticleTableContentProvider(
            table, objectIds, tableConfiguration.loadingOptions, contextId, objects
        );

        table.setContentProvider(contentProvider);
        table.setColumnConfiguration(tableConfiguration.tableColumns);

        return table;
    }

    private setDefaultTableConfiguration(
        tableConfiguration: TableConfiguration, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean
    ): TableConfiguration {
        const tableColumns = this.getDefaultColumns(short);

        if (!tableConfiguration) {
            tableConfiguration = new TableConfiguration(null, null, null,
                KIXObjectType.FAQ_ARTICLE, null, null, tableColumns, [], true, false
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

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        switch (property) {
            case FAQArticleProperty.NUMBER:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.NUMBER, true, false, true, false, 120, true, true
                );
            case FAQArticleProperty.TITLE:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.TITLE, true, false, true, false, 300, true, true, false, DataType.STRING, true,
                    undefined, undefined, false
                );
            case FAQArticleProperty.LANGUAGE:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.LANGUAGE, true, false, true, false, 125, true, true, true
                );
            case FAQArticleProperty.CUSTOMER_VISIBLE:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.CUSTOMER_VISIBLE, false, true, false, true, 75, true, true, true
                );
            case FAQArticleProperty.RATING:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.RATING, true, true, true, false, 120, true, true, true, DataType.NUMBER, false,
                    null, null, null, true, true
                );
            case FAQArticleProperty.CATEGORY_ID:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.CATEGORY_ID, true, false, true, false, 125, true, true, true
                );
            case FAQArticleProperty.CHANGED:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.CHANGED, true, false, true, false, 125, true, true, false, DataType.DATE_TIME
                );
            case FAQArticleProperty.CHANGED_BY:
                return new DefaultColumnConfiguration(null, null, null,
                    FAQArticleProperty.CHANGED_BY, true, false, true, false, 150, true, true
                );
            default:
                return super.getDefaultColumnConfiguration(property);
        }
    }

    public getColumnFilterValues<T extends KIXObject>(
        rows: Row[], column: Column, values: Array<[T, number]> = []
    ): Array<[T, number]> {
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
                const childRows = r.getChildren();
                if (childRows && !!childRows.length) {
                    this.getColumnFilterValues(childRows, column, values);
                }
            });
        } else if (column.getColumnId() === FAQArticleProperty.RATING) {
            rows.forEach((r) => {
                const cell = r.getCell(column.getColumnId());
                if (cell) {
                    const cellValue = cell.getValue();
                    const rating = cellValue.objectValue ? BrowserUtil.round(cellValue.objectValue) : '';
                    const existingValue = values.find((v) => (v[0] as any === rating));

                    if (existingValue) {
                        existingValue[1] += 1;
                    } else {
                        values.push([rating as any, 1]);
                    }
                }
                const childRows = r.getChildren();
                if (childRows && !!childRows.length) {
                    this.getColumnFilterValues(childRows, column, values);
                }
            });
        } else {
            values = TableFactory.getColumnFilterValues(rows, column);
        }

        return values;
    }

    private getDefaultColumns(short: boolean = false): IColumnConfiguration[] {
        let tableColumns = [];
        if (short) {
            tableColumns = [
                this.getDefaultColumnConfiguration(FAQArticleProperty.NUMBER),
                this.getDefaultColumnConfiguration(FAQArticleProperty.TITLE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.LANGUAGE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.RATING),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CATEGORY_ID)
            ];
        } else {
            tableColumns = [
                this.getDefaultColumnConfiguration(FAQArticleProperty.NUMBER),
                this.getDefaultColumnConfiguration(FAQArticleProperty.TITLE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.LANGUAGE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CUSTOMER_VISIBLE),
                this.getDefaultColumnConfiguration(FAQArticleProperty.RATING),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CATEGORY_ID),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CHANGED),
                this.getDefaultColumnConfiguration(FAQArticleProperty.CHANGED_BY)
            ];
        }

        return tableColumns;
    }

    public async getDefaultColumnConfigurations(searchCache: SearchCache): Promise<IColumnConfiguration[]> {
        const superColumns = await super.getDefaultColumnConfigurations(searchCache);
        const ticketColumns = this.getDefaultColumns();
        return [
            ...ticketColumns,
            ...superColumns.filter((c) => !ticketColumns.some((tc) => tc.property === c.property))
        ];
    }

}
