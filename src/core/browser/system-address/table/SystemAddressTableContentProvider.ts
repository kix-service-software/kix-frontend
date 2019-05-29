import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, SystemAddress, FilterCriteria } from "../../../model";
import { ITable } from "../../table";

export class SystemAddressTableContentProvider extends TableContentProvider<SystemAddress> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.SYSTEM_ADDRESS, table, objectIds, loadingOptions, contextId);
    }

}
