import { ITable } from "../../table";
import { FAQArticle } from "../../../model/kix/faq";
import { KIXObjectType, KIXObjectLoadingOptions } from "../../../model";
import { TableContentProvider } from "../../table/TableContentProvider";

export class FAQArticleTableContentProvider extends TableContentProvider<FAQArticle> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.FAQ_ARTICLE, table, objectIds, loadingOptions, contextId);
    }
}
