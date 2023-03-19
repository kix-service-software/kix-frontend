/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../table/webapp/core/TableContentProvider';
import { Article } from '../../../../model/Article';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { RowObject } from '../../../../../table/model/RowObject';
import { Table } from '../../../../../table/model/Table';
import { TableValue } from '../../../../../table/model/TableValue';

export class ArticleTableContentProvider extends TableContentProvider<Article> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.ARTICLE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<Article>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const articles = await context.getObjectList<Article>(KIXObjectType.ARTICLE);
            if (articles) {
                articles.sort((a, b) => b.ArticleID - a.ArticleID);

                for (let i = 0; i < articles.length; i++) {
                    const a = articles[i];
                    const values: TableValue[] = [];

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        if (column.property === ArticleProperty.NUMBER) {
                            const count = articles.length - i;
                            values.push(new TableValue(ArticleProperty.NUMBER, count, count.toString()));
                        } else if (column.property === ArticleProperty.ARTICLE_INFORMATION) {
                            values.push(new TableValue(ArticleProperty.ARTICLE_INFORMATION, null));
                        } else {
                            const tableValue = new TableValue(column.property, a[column.property]);
                            values.push(tableValue);
                        }
                    }

                    rowObjects.push(new RowObject<Article>(values, a as Article));
                }
            }
        }

        return rowObjects;
    }
}
