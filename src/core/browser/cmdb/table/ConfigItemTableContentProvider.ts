import { ITable, } from "../../table";
import { ConfigItem, KIXObjectLoadingOptions, KIXObjectType } from "../../../model";
import { TableContentProvider } from "../../table/TableContentProvider";

export class ConfigItemTableContentProvider extends TableContentProvider<ConfigItem> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM, table, objectIds, loadingOptions, contextId);
    }

}
