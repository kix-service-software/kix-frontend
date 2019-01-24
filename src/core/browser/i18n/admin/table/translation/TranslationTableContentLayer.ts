import { AbstractTableLayer, TableRow, TableValue } from "../../../../standard-table";
import { Translation, KIXObject } from "../../../../../model";

export class TranslationTableContentLayer extends AbstractTableLayer {

    private translations: Translation[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTranslations: Translation[] = null
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(ticketTypes: T[]): void {
        this.preLoadedTranslations = (ticketTypes as any);
    }

    public async getRows(reload: boolean = false): Promise<Array<TableRow<Translation>>> {
        let loadedTranslations = this.translations;
        if (this.preLoadedTranslations) {
            loadedTranslations = this.preLoadedTranslations;
        } else if (!this.dataLoaded || reload) {
            await this.loadTranslations();
            loadedTranslations = this.translations;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const th of loadedTranslations) {
            const values = columns.map((c) => new TableValue(c.id, th[c.id], '', [], null));
            rows.push(new TableRow(th, values, []));
        }

        return rows;
    }

    private loadTranslations(): void {
        this.dataLoaded = true;
    }
}
