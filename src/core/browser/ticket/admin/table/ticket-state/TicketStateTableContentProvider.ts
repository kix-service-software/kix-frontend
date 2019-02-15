import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, TicketState } from "../../../../../model";
import { ITable } from "../../../../table";

export class TicketStateTableContentProvider extends TableContentProvider<TicketState> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET_STATE, table, objectIds, loadingOptions, contextId);
    }

}
