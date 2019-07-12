import { TableContentProvider } from "../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, Notification } from "../../../model";
import { ITable } from "../../table";

export class NotifiactionTableContentProvider extends TableContentProvider<Notification> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.NOTIFICATION, table, objectIds, loadingOptions, contextId);
    }

}
