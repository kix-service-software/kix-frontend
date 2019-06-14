import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions } from "../../../model";
import { ITable } from "../../table";
import { SysConfigItem } from "../../../model/kix/sysconfig/SysConfigItem";

export class SysConfigTableContentProvider extends TableContentProvider<SysConfigItem> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.SYS_CONFIG_ITEM, table, objectIds, loadingOptions, contextId);
    }

}
