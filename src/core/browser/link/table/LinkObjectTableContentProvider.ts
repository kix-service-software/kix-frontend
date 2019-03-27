import { TableContentProvider } from "../../table/TableContentProvider";
import { LinkObject, KIXObjectLoadingOptions, KIXObjectType } from "../../../model";
import { ITable } from "../../table";

export class LinkObjectTableContentProvider extends TableContentProvider<LinkObject> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.LINK_OBJECT, table, objectIds, loadingOptions, contextId);
    }

}
