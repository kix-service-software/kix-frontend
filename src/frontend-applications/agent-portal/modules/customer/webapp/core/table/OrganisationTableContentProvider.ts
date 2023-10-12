/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { Organisation } from '../../../model/Organisation';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { OrganisationProperty } from '../../../model/OrganisationProperty';
import { TicketStats } from '../../../model/TicketStats';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class OrganisationTableContentProvider extends TableContentProvider<Organisation> {

    public constructor(
        table: Table,
        objectIds: string[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.ORGANISATION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<Organisation>>> {
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
