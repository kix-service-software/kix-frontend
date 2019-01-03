import { AbstractTableLayer, TableRow, TableValue } from "../../../../standard-table";
import { TicketState, KIXObject } from "../../../../../model";

export class TicketStateTableContentLayer extends AbstractTableLayer {

    private ticketStates: TicketState[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTicketStates: TicketState[] = null
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(ticketStates: T[]): void {
        this.preLoadedTicketStates = (ticketStates as any);
    }

    public async getRows(): Promise<Array<TableRow<TicketState>>> {
        let loadedTicketStates = this.ticketStates;
        if (this.preLoadedTicketStates) {
            loadedTicketStates = this.preLoadedTicketStates;
        } else if (!this.dataLoaded) {
            await this.loadTicketStates();
            loadedTicketStates = this.ticketStates;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const th of loadedTicketStates) {
            const values = columns.map((c) => new TableValue(c.id, th[c.id], '', [], null));
            rows.push(new TableRow(th, values, []));
        }

        return rows;
    }

    private loadTicketStates(): void {
        this.dataLoaded = true;
    }
}
