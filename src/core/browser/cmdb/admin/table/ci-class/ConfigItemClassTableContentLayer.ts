import { AbstractTableLayer, TableRow, TableValue } from "../../../../standard-table";
import { KIXObject, ConfigItemClass } from "../../../../../model";

export class ConfigItemClassTableContentLayer extends AbstractTableLayer {

    private ciClasses: ConfigItemClass[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedCIClasses: ConfigItemClass[] = null
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(priorities: T[]): void {
        this.preLoadedCIClasses = (priorities as any);
    }

    public async getRows(reload: boolean = false): Promise<Array<TableRow<ConfigItemClass>>> {
        let loadedCIClasses = this.ciClasses;
        if (this.preLoadedCIClasses) {
            loadedCIClasses = this.preLoadedCIClasses;
        } else if (!this.dataLoaded || reload) {
            await this.loadCIClasses();
            loadedCIClasses = this.ciClasses;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const th of loadedCIClasses) {
            const values = columns.map((c) => new TableValue(c.id, th[c.id], '', [], null));
            rows.push(new TableRow(th, values, []));
        }

        return rows;
    }

    private loadCIClasses(): void {
        this.dataLoaded = true;
    }
}
