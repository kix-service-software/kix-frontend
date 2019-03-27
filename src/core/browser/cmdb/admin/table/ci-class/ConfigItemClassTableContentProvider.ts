import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, ConfigItemClass } from "../../../../../model";
import { ITable } from "../../../../table";

export class ConfigItemClassTableContentProvider extends TableContentProvider<ConfigItemClass> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_CLASS, table, objectIds, loadingOptions, contextId);
    }

}
