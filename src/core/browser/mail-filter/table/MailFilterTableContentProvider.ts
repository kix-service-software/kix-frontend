import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, MailFilter } from "../../../model";
import { ITable } from "../../table";

export class MailFilterTableContentProvider extends TableContentProvider<MailFilter> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.MAIL_FILTER, table, objectIds, loadingOptions, contextId);
    }

}
