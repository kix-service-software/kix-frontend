import { AbstractTableLayer, TableRow, TableValue } from "../../../../standard-table";
import { KIXObject, TicketPriority } from "../../../../../model";

export class TicketPriorityTableContentLayer extends AbstractTableLayer {

    private priorities: TicketPriority[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTicketPriorities: TicketPriority[] = null
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(priorities: T[]): void {
        this.preLoadedTicketPriorities = (priorities as any);
    }

    public async getRows(): Promise<Array<TableRow<TicketPriority>>> {
        let loadedPriorities = this.priorities;
        if (this.preLoadedTicketPriorities) {
            loadedPriorities = this.preLoadedTicketPriorities;
        } else if (!this.dataLoaded) {
            await this.loadTicketPriorities();
            loadedPriorities = this.priorities;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const th of loadedPriorities) {
            const values = columns.map((c) => new TableValue(c.id, th[c.id], '', [], null));
            rows.push(new TableRow(th, values, []));
        }

        return rows;
    }

    private loadTicketPriorities(): void {
        this.dataLoaded = true;
    }
}
