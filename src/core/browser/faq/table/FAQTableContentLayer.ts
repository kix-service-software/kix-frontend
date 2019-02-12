import {
    KIXObjectType, FilterCriteria,
    KIXObject, KIXObjectLoadingOptions
} from '../../../model';
import { TableRow, AbstractTableLayer, TableValue } from '../../standard-table';
import { FAQArticle } from '../../../model/kix/faq';
import { KIXObjectService } from '../../kix';

export class FAQTableContentLayer extends AbstractTableLayer {

    private faqArticles: FAQArticle[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedFAQArticles: FAQArticle[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(faqArticles: T[]): void {
        this.preLoadedFAQArticles = (faqArticles as any);
    }

    public async getRows(reload: boolean = false): Promise<any[]> {
        let loadedFAQArticles = this.faqArticles;
        if (this.preLoadedFAQArticles) {
            loadedFAQArticles = this.preLoadedFAQArticles;
        } else if (!this.dataLoaded || reload) {
            await this.loadFAQArticles();
            loadedFAQArticles = this.faqArticles;
        }

        const columns = await this.getColumns();
        const rows = [];

        for (const t of loadedFAQArticles) {
            const values = columns.map((c) => new TableValue(c.id, t[c.id], '', [], null));
            rows.push(new TableRow(t, values, []));
        }

        return rows;
    }

    private async loadFAQArticles(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, this.filter, this.sortOrder, null, this.limit, ['Votes'], ['Votes']
        );
        this.faqArticles = await KIXObjectService.loadObjects<FAQArticle>(
            KIXObjectType.FAQ_ARTICLE, null, loadingOptions, null, false
        );
        this.dataLoaded = true;
    }
}
