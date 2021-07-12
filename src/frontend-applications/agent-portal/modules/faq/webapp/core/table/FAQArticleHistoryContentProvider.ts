/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { FAQHistory } from '../../../model/FAQHistory';
import { Table, RowObject, TableValue } from '../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { FAQArticle } from '../../../model/FAQArticle';

export class FAQArticleHistoryContentProvider extends TableContentProvider<FAQHistory> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_HISTORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<FAQHistory>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const faqArticle = await context.getObject<FAQArticle>();
            if (faqArticle) {
                for (const fh of faqArticle.History) {
                    const values: TableValue[] = [];
                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        const tableValue = new TableValue(column.property, fh[column.property]);
                        values.push(tableValue);
                    }
                    rowObjects.push(new RowObject<FAQHistory>(values, fh));
                }
            }
        }
        return rowObjects;
    }
}
