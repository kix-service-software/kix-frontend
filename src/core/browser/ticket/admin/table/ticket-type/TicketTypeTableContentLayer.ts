import { AbstractTableLayer, TableRow, TableValue } from "../../../../standard-table";
import { TicketType, KIXObject } from "../../../../../model";

export class TicketTypeTableContentLayer extends AbstractTableLayer {

    private ticketTypes: TicketType[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTicketTypes: TicketType[] = null
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(ticketTypes: T[]): void {
        this.preLoadedTicketTypes = (ticketTypes as any);
    }

    public async getRows(reload: boolean = false): Promise<Array<TableRow<TicketType>>> {
        let loadedTicketTypes = this.ticketTypes;
        if (this.preLoadedTicketTypes) {
            loadedTicketTypes = this.preLoadedTicketTypes;
        } else if (!this.dataLoaded || reload) {
            await this.loadTicketTypes();
            loadedTicketTypes = this.ticketTypes;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const th of loadedTicketTypes) {
            const values = columns.map((c) => new TableValue(c.id, th[c.id], '', [], null));
            rows.push(new TableRow(th, values, []));
        }

        return rows;
    }

    private loadTicketTypes(): void {
        this.dataLoaded = true;
    }
}
