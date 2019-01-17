import { Article, Ticket } from '../../../../model';
import { AbstractTableLayer, TableRow, TableValue } from '../../..';

export class ArticleTableContentLayer extends AbstractTableLayer {

    private articles: Article[] = [];

    private articlesLoaded: boolean = false;

    public constructor(private ticket: Ticket) {
        super();
    }

    public async getRows(reload: boolean = false): Promise<Array<TableRow<Article>>> {
        if (!this.articlesLoaded) {
            this.initArticles();
        }

        const columns = await this.getColumns();
        const rows = [];

        for (const a of this.articles) {
            const values = columns.map((c) => new TableValue(c.id, a[c.id], '', [], null));
            rows.push(new TableRow(a, values, []));
        }

        return rows;
    }

    private initArticles(): void {
        if (this.ticket) {
            this.articles = this.ticket.Articles;
            this.articles.sort((a, b) => b.IncomingTime - a.IncomingTime);
            this.articlesLoaded = true;
        }
    }

}
