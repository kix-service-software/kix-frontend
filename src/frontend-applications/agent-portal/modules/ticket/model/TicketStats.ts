/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class TicketStats {

    public TotalCount: number;

    public EscalatedCount: number;

    public LockCount: number;

    public constructor(ticketStats?: TicketStats) {
        if (ticketStats) {
            this.TotalCount = ticketStats.TotalCount ? Number(ticketStats.TotalCount) : 0;
            this.EscalatedCount = ticketStats.EscalatedCount ? Number(ticketStats.EscalatedCount) : 0;
            this.LockCount = ticketStats.LockCount ? Number(ticketStats.LockCount) : 0;
        }
    }

}
