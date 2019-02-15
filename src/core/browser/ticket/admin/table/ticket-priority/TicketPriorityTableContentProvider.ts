import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, TicketPriority } from "../../../../../model";
import { ITable } from "../../../../table";

export class TicketPriorityTableContentProvider extends TableContentProvider<TicketPriority> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET_PRIORITY, table, objectIds, loadingOptions, contextId);
    }

}
