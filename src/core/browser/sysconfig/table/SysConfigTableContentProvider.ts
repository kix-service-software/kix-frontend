import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions } from "../../../model";
import { ITable } from "../../table";
import { SysConfigOptionDefinition } from "../../../model/kix/sysconfig/SysConfigOptionDefinition";

export class SysConfigTableContentProvider extends TableContentProvider<SysConfigOptionDefinition> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, table, objectIds, loadingOptions, contextId);
    }

}
