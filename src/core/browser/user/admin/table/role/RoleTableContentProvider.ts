import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, Role } from "../../../../../model";
import { ITable } from "../../../../table";

export class RoleTableContentProvider extends TableContentProvider<Role> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.ROLE, table, objectIds, loadingOptions, contextId);
    }

}
