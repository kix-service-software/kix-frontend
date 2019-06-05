import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, TextModule } from "../../../model";
import { ITable } from "../../table";

export class TextModulesTableContentProvider extends TableContentProvider<TextModule> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TEXT_MODULE, table, objectIds, loadingOptions, contextId);
    }

}
