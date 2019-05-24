import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, MailAccount } from "../../../model";
import { ITable } from "../../table";

export class MailAccountTableContentProvider extends TableContentProvider<MailAccount> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.MAIL_ACCOUNT, table, objectIds, loadingOptions, contextId);
    }

}
