import { Article, ArticleProperty, ObjectIcon } from '../../../../model';
import { AbstractTableLayer, TableRow, TableColumn } from '../../..';
import { ArticleLabelProvider } from '../..';

export class ArticleTableLabelLayer extends AbstractTableLayer {

    private labelProvider: ArticleLabelProvider = new ArticleLabelProvider();

    public async getColumns(): Promise<TableColumn[]> {
        const columns = await this.getPreviousLayer().getColumns();
        for (const col of columns) {
            col.text = await this.labelProvider.getPropertyText(col.id);
        }
        return columns;
    }

    public async getRows(refresh: boolean = false): Promise<Array<TableRow<Article>>> {
        const rows: Array<TableRow<Article>> = await this.getPreviousLayer().getRows(refresh);
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            for (const value of row.values) {
                if (value.columnId === ArticleProperty.NUMBER) {
                    const index = rows.findIndex((r) => r.object.ArticleID === row.object.ArticleID);
                    if (index !== -1) {
                        value.displayValue = (rows.length - index).toString();
                    }
                }
                value.classes = this.labelProvider.getDisplayTextClasses(row.object, value.columnId);
            }

            row.classes = this.labelProvider.getObjectClasses(row.object);
        }
        return rows;
    }
}
