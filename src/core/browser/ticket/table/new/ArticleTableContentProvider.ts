import { IRowObject, RowObject, ITable, TableValue } from "../../../table";
import { Ticket, KIXObjectType, Article, ArticleProperty, KIXObjectLoadingOptions } from "../../../../model";
import { ContextService } from "../../../context";
import { TableContentProvider } from "../../../table/TableContentProvider";

export class ArticleTableContentProvider extends TableContentProvider<Article> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.FAQ_ARTICLE, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Article>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const ticket = await context.getObject<Ticket>();
            if (ticket) {
                rowObjects = ticket.Articles
                    .sort((a, b) => b.ArticleID - a.ArticleID)
                    .map((a, i) => {
                        const values: TableValue[] = [];

                        for (const property in a) {
                            if (a.hasOwnProperty(property)) {
                                values.push(new TableValue(property, a[property]));
                            }
                        }

                        values.push(new TableValue(ArticleProperty.NUMBER, ticket.Articles.length - i));
                        values.push(new TableValue(ArticleProperty.ARTICLE_INFORMATION, null));
                        return new RowObject<Article>(values, a);
                    });
            }
        }

        return rowObjects;
    }
}
