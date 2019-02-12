import { FilterCriteria, KIXObject } from '../../../model';
import { TableRow, AbstractTableLayer, TableValue } from '../../standard-table';
import { FAQHistory } from '../../../model/kix/faq';

export class FAQArticleHistoryTableContentLayer extends AbstractTableLayer {

    private faqArticleHistory: FAQHistory[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedFAQArticleHistory: FAQHistory[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(faqHistory: T[]): void {
        this.preLoadedFAQArticleHistory = (faqHistory as any);
    }

    public async getRows(reload: boolean = false): Promise<any[]> {
        let loadedFAQArticleHistory = this.faqArticleHistory;
        if (this.preLoadedFAQArticleHistory) {
            loadedFAQArticleHistory = this.preLoadedFAQArticleHistory;
        } else if (!this.dataLoaded || reload) {
            await this.loadFAQArticleHistory();
            loadedFAQArticleHistory = this.faqArticleHistory;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const t of loadedFAQArticleHistory) {
            const values = columns.map((c) => new TableValue(c.id, t[c.id], '', [], null));
            rows.push(new TableRow(t, values, []));
        }

        return rows;
    }

    private async loadFAQArticleHistory(): Promise<void> {
        this.dataLoaded = true;
    }
}
