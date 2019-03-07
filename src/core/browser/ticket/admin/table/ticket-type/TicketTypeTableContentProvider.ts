import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, TicketType } from "../../../../../model";
import { ITable } from "../../../../table";

export class TicketTypeTableContentProvider extends TableContentProvider<TicketType> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET_TYPE, table, objectIds, loadingOptions, contextId);
    }

}
