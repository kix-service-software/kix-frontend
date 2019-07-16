export class TicketStats {

    public OpenCount: number;

    public PendingReminderCount: number;

    public NewCount: number;

    public EscalatedCount: number;

    public LockCount: number;

    public constructor(ticketStats?: TicketStats) {
        if (ticketStats) {
            this.OpenCount = ticketStats.OpenCount ? Number(ticketStats.OpenCount) : 0;
            this.PendingReminderCount = ticketStats.PendingReminderCount ? Number(ticketStats.PendingReminderCount) : 0;
            this.NewCount = ticketStats.NewCount ? Number(ticketStats.NewCount) : 0;
            this.EscalatedCount = ticketStats.EscalatedCount ? Number(ticketStats.EscalatedCount) : 0;
            this.LockCount = ticketStats.LockCount ? Number(ticketStats.LockCount) : 0;
        }
    }

}
