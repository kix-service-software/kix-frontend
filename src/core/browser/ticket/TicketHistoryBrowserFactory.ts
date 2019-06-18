import { TicketHistory } from '../../model';
import { KIXObjectFactory } from '../kix';

export class TicketHistoryBrowserFactory extends KIXObjectFactory<TicketHistory> {

    private static INSTANCE: TicketHistoryBrowserFactory;

    public static getInstance(): TicketHistoryBrowserFactory {
        if (!TicketHistoryBrowserFactory.INSTANCE) {
            TicketHistoryBrowserFactory.INSTANCE = new TicketHistoryBrowserFactory();
        }
        return TicketHistoryBrowserFactory.INSTANCE;
    }

    protected constructor() {
        super();
    }

    public async create(history: TicketHistory): Promise<TicketHistory> {
        return new TicketHistory(history);
    }

}
