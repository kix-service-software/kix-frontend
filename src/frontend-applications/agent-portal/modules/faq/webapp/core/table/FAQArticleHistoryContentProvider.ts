/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../base-components/webapp/core/table/TableContentProvider";
import { FAQHistory } from "../../../model/FAQHistory";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ContextService } from "../../../../../modules/base-components/webapp/core/ContextService";
import { FAQArticle } from "../../../model/FAQArticle";

export class FAQArticleHistoryContentProvider extends TableContentProvider<FAQHistory> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_HISTORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<FAQHistory>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const faqArticle = await context.getObject<FAQArticle>();
            if (faqArticle) {
                rowObjects = faqArticle.History
                    .sort((a, b) => b.ID - a.ID)
                    .map((fh) => {
                        const values: TableValue[] = [];

                        for (const property in fh) {
                            if (fh.hasOwnProperty(property)) {
                                values.push(new TableValue(property, fh[property]));
                            }
                        }

                        return new RowObject<FAQHistory>(values, fh);
                    });
            }
        }

        return rowObjects;
    }
}
