import {
    Organisation, KIXObjectLoadingOptions, KIXObjectType, OrganisationProperty, TicketStats
} from "../../../model";
import { ITable, IRowObject, TableValue } from "../../table";
import { TableContentProvider } from "../../table/TableContentProvider";

export class OrganisationTableContentProvider extends TableContentProvider<Organisation> {

    public constructor(
        table: ITable,
        objectIds: string[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.ORGANISATION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Organisation>>> {
        const rowObjects = await super.loadData();

        rowObjects.forEach((ro) => {
            const ticketStatsValue = ro.getValues().find((v) => v[0] === OrganisationProperty.TICKET_STATS);
            if (ticketStatsValue) {
                const ticketStats: TicketStats = ticketStatsValue[1];
                ro.addValue(new TableValue(OrganisationProperty.OPEN_TICKETS_COUNT, ticketStats.OpenCount));
                ro.addValue(new TableValue(OrganisationProperty.ESCALATED_TICKETS_COUNT, ticketStats.EscalatedCount));
                ro.addValue(
                    new TableValue(OrganisationProperty.REMINDER_TICKETS_COUNT, ticketStats.PendingReminderCount)
                );
            }
        });

        return rowObjects;
    }
}
