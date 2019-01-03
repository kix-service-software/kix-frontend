import { TableRow, AbstractTableLayer, TableValue } from '../../../standard-table';
import { TicketHistory, KIXObject, FilterCriteria } from '../../../../model';

export class TicketHistoryTableContentLayer extends AbstractTableLayer {

    private ticketHistory: TicketHistory[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTicketHistory: TicketHistory[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(ticketHistory: T[]): void {
        this.preLoadedTicketHistory = (ticketHistory as any);
    }

    public async getRows(): Promise<Array<TableRow<TicketHistory>>> {
        let loadedTicketHistory = this.ticketHistory;
        if (this.preLoadedTicketHistory) {
            loadedTicketHistory = this.preLoadedTicketHistory;
        } else if (!this.dataLoaded) {
            await this.loadTicketHistory();
            loadedTicketHistory = this.ticketHistory;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const th of loadedTicketHistory) {
            const values = columns.map((c) => new TableValue(c.id, th[c.id], '', [], null));
            rows.push(new TableRow(th, values, []));
        }

        return rows;
    }

    private loadTicketHistory(): void {
        this.dataLoaded = true;
    }
}
