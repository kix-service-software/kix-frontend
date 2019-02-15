import { IRowObject, RowObject, ITable, TableValue } from "../../table";
import { KIXObjectType, KIXObjectLoadingOptions, ConfigItemHistory, ConfigItem } from "../../../model";
import { ContextService } from "../../context";
import { TableContentProvider } from "../../table/TableContentProvider";
import { FAQHistory, FAQArticle } from "../../../model/kix/faq";

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
