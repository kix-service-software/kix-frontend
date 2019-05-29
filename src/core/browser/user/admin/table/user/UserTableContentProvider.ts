import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, User } from "../../../../../model";
import { ITable } from "../../../../table";

export class UserTableContentProvider extends TableContentProvider<User> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.USER, table, objectIds, loadingOptions, contextId);
    }

}
