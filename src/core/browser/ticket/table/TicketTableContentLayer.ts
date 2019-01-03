import {
    Ticket, KIXObjectType, FilterCriteria,
    TicketProperty, KIXObject, KIXObjectLoadingOptions
} from '../../../model';
import { TableRow, AbstractTableLayer, TableValue } from '../../standard-table';
import { KIXObjectService } from '../../kix';

export class TicketTableContentLayer extends AbstractTableLayer {

    private tickets: Ticket[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTickets: Ticket[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(tickets: T[]): void {
        this.preLoadedTickets = (tickets as any);
    }

    public async getRows(): Promise<any[]> {
        let loadedTickets = this.tickets;
        if (this.preLoadedTickets) {
            loadedTickets = this.preLoadedTickets;
        } else if (!this.dataLoaded) {
            await this.loadTickets();
            loadedTickets = this.tickets;
        }

        const columns = await this.getColumns();
        const rows = [];

        for (const t of loadedTickets) {
            const values = columns.map((c) => {
                let value = t[c.id];
                if (c.id === TicketProperty.TICKET_FLAG) {
                    if (t.Articles.some((a) => a.isUnread())) {
                        value = 'ArticleUnread';
                    }
                }

                return new TableValue(c.id, value, '', [], null);
            });

            rows.push(new TableRow(t, values, []));
        }

        return rows;
    }

    private async loadTickets(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, this.filter, this.sortOrder, null, this.limit, ['Watchers']
        );
        this.tickets = await KIXObjectService.loadObjects<Ticket>(
            KIXObjectType.TICKET, null, loadingOptions, null, false
        ).catch((error) => []);

        this.dataLoaded = true;
    }
}
