import { IRowObject, RowObject, ITable, TableValue } from "../../table";
import { Ticket, KIXObjectType, TicketHistory, KIXObjectLoadingOptions } from "../../../model";
import { ContextService } from "../../context";
import { TableContentProvider } from "../../table/TableContentProvider";

export class TicketHistoryContentProvider extends TableContentProvider<TicketHistory> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TICKET_HISTORY, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<TicketHistory>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const ticket = await context.getObject<Ticket>();
            if (ticket) {
                rowObjects = ticket.History
                    .sort((a, b) => b.HistoryID - a.HistoryID)
                    .map((th) => {
                        const values: TableValue[] = [];

                        for (const property in th) {
                            if (th.hasOwnProperty(property)) {
                                values.push(new TableValue(property, th[property]));
                            }
                        }

                        return new RowObject<TicketHistory>(values, th);
                    });
            }
        }

        return rowObjects;
    }
}
