import { AbstractTableLayer, TableRow, TableValue } from "../../../../standard-table";
import { TranslationLanguage, KIXObject } from "../../../../../model";

export class TranslationLanguageTableContentLayer extends AbstractTableLayer {

    private TranslationLanguages: TranslationLanguage[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedTranslationLanguages: TranslationLanguage[] = null
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(ticketTypes: T[]): void {
        this.preLoadedTranslationLanguages = (ticketTypes as any);
    }

    public async getRows(reload: boolean = false): Promise<Array<TableRow<TranslationLanguage>>> {
        let loadedTranslationLanguages = this.TranslationLanguages;
        if (this.preLoadedTranslationLanguages) {
            loadedTranslationLanguages = this.preLoadedTranslationLanguages;
        } else if (!this.dataLoaded || reload) {
            await this.loadTranslationLanguages();
            loadedTranslationLanguages = this.TranslationLanguages;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const th of loadedTranslationLanguages) {
            const values = columns.map((c) => new TableValue(c.id, th[c.id], '', [], null));
            rows.push(new TableRow(th, values, []));
        }

        return rows;
    }

    private loadTranslationLanguages(): void {
        this.dataLoaded = true;
    }
}
