import { AbstractTableLayer, TableRow, TableValue } from "../../standard-table";
import { TextModule, FilterCriteria, KIXObject } from "../../../model";

export class TextModulesTableContentLayer extends AbstractTableLayer {

    private textModules: TextModule[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTicketTypes: TextModule[] = null,
        public filter: FilterCriteria[] = null
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(ticketTypes: T[]): void {
        this.preLoadedTicketTypes = (ticketTypes as any);
    }

    public async getRows(reload: boolean = false): Promise<Array<TableRow<TextModule>>> {
        let loadedTicketTypes = this.textModules;
        if (this.preLoadedTicketTypes) {
            loadedTicketTypes = this.preLoadedTicketTypes;
        } else if (!this.dataLoaded || reload) {
            await this.loadTicketTypes();
            loadedTicketTypes = this.textModules;
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
