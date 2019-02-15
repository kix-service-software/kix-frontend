import { Ticket, KIXObjectType, KIXObjectLoadingOptions } from "../../../../model";
import { TableContentProvider } from "../../../table/TableContentProvider";
import { ITable } from "../../../table";

export class TicketTableContentProvider extends TableContentProvider<Ticket> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET, table, objectIds, loadingOptions, contextId);
    }

}
