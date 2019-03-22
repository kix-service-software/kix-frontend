import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, Role } from "../../../../../model";
import { ITable } from "../../../../table";

export class UserTableContentProvider extends TableContentProvider<Role> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.USER, table, objectIds, loadingOptions, contextId);
    }

}
