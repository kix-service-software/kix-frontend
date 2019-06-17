import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions } from "../../../model";
import { ITable } from "../../table";
import { SysConfigOption } from "../../../model/kix/sysconfig/SysConfigOption";

export class SysConfigTableContentProvider extends TableContentProvider<SysConfigOption> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.SYS_CONFIG_OPTION, table, objectIds, loadingOptions, contextId);
    }

}
