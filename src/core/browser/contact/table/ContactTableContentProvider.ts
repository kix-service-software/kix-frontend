/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Contact, KIXObjectLoadingOptions, KIXObjectType, ContactProperty } from "../../../model";
import { ITable, IRowObject, TableValue } from "../../table";
import { TableContentProvider } from "../../table/TableContentProvider";
import { TicketStats } from "../../../model/kix/organisation/TicketStats";

export class ContactTableContentProvider extends TableContentProvider<Contact> {

    public constructor(
        table: ITable,
        objectIds: string[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONTACT, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Contact>>> {
        const rowObjects = await super.loadData();

        rowObjects.forEach((ro) => {
            const ticketStatsValue = ro.getValues().find((v) => v[0] === ContactProperty.TICKET_STATS);
            if (ticketStatsValue) {
                const ticketStats: TicketStats = ticketStatsValue[1];
                ro.addValue(new TableValue(ContactProperty.OPEN_TICKETS_COUNT, ticketStats.OpenCount));
                ro.addValue(new TableValue(ContactProperty.ESCALATED_TICKETS_COUNT, ticketStats.EscalatedCount));
                ro.addValue(new TableValue(ContactProperty.REMINDER_TICKETS_COUNT, ticketStats.PendingReminderCount));
            }
        });

        return rowObjects;
    }
}
