/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { Contact } from '../../../model/Contact';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ContactProperty } from '../../../model/ContactProperty';
import { TicketStats } from '../../../model/TicketStats';
import { UserProperty } from '../../../../user/model/UserProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { User } from '../../../../user/model/User';
import { RowObject } from '../../../../table/model/RowObject';
import { Table } from '../../../../table/model/Table';
import { TableValue } from '../../../../table/model/TableValue';

export class ContactTableContentProvider extends TableContentProvider<Contact> {

    public constructor(
        table: Table,
        objectIds: string[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONTACT, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<Contact>>> {
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

    protected async prepareSpecificValues(values: TableValue[], contact: Contact): Promise<void> {
        await super.prepareSpecificValues(values, contact);
        for (const value of values) {
            if (this.isUserProperty(value.property)) {
                let user = contact.User;
                if (!user && contact.AssignedUserID) {
                    const users = await KIXObjectService.loadObjects<User>(
                        KIXObjectType.USER, [contact.AssignedUserID], null, null, true, true, true
                    ).catch(() => [] as User[]);
                    user = users && users.length ? users[0] : null;
                }
                if (user) {
                    value.objectValue = user[value.property];
                } else if (value.property === UserProperty.IS_AGENT || value.property === UserProperty.IS_CUSTOMER) {
                    value.objectValue = 0;
                }
            }
        }
    }

    private isUserProperty(property: string): boolean {
        const userProperties = Object.keys(UserProperty).map((p) => UserProperty[p]);
        return userProperties.some((p) => p === property);
    }
}
