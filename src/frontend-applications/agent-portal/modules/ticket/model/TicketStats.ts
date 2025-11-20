/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */
import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class TicketStats extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: string = KIXObjectType.QUEUE_TICKET_STATS;

    public TotalCount: number;

    public EscalatedCount: number;

    public LockCount: number;

    public QueueID: number;

    public constructor(ticketStats?: TicketStats) {
        super(ticketStats);

        if (ticketStats) {
            this.TotalCount = ticketStats.TotalCount ? Number(ticketStats.TotalCount) : 0;
            this.EscalatedCount = ticketStats.EscalatedCount ? Number(ticketStats.EscalatedCount) : 0;
            this.LockCount = ticketStats.LockCount ? Number(ticketStats.LockCount) : 0;
        }
    }

}
