import { Customer, KIXObjectLoadingOptions, KIXObjectType, CustomerProperty, TicketStats } from "../../../model";
import { ITable, IRowObject, TableValue } from "../../table";
import { TableContentProvider } from "../../table/TableContentProvider";

export class CustomerTableContentProvider extends TableContentProvider<Customer> {

    public constructor(
        table: ITable,
        objectIds: string[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CUSTOMER, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Customer>>> {
        const rowObjects = await super.loadData();

        rowObjects.forEach((ro) => {
            const ticketStatsValue = ro.getValues().find((v) => v[0] === CustomerProperty.TICKET_STATS);
            if (ticketStatsValue) {
                const ticketStats: TicketStats = ticketStatsValue[1];
                ro.addValue(new TableValue(CustomerProperty.OPEN_TICKETS_COUNT, ticketStats.OpenCount));
                ro.addValue(new TableValue(CustomerProperty.ESCALATED_TICKETS_COUNT, ticketStats.EscalatedCount));
                ro.addValue(new TableValue(CustomerProperty.REMINDER_TICKETS_COUNT, ticketStats.PendingReminderCount));
            }
        });

        return rowObjects;
    }
}
