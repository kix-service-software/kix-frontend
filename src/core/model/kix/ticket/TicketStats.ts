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
