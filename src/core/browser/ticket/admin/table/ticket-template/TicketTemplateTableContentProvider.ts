import { TableContentProvider } from "../../../../table/TableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, TicketTemplate } from "../../../../../model";
import { ITable } from "../../../../table";

export class TicketStateTableContentProvider extends TableContentProvider<TicketTemplate> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET_TEMPLATE, table, objectIds, loadingOptions, contextId);
    }

}
