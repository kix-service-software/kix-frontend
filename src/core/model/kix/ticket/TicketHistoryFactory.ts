import { TicketHistory } from './TicketHistory';

export class TicketHistoryFactory {

    public static create(ticketHistory: TicketHistory): TicketHistory {
        return new TicketHistory(ticketHistory);
    }

}
