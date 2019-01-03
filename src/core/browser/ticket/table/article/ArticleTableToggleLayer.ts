import { TableToggleLayer, ITableToggleListener } from '../../..';
import { IEventListener, EventService } from '../../../event';
import { IdService } from '../../../IdService';

export class ArticleTableToggleLayer extends TableToggleLayer implements IEventListener {

    public eventSubscriberId: string;

    public constructor(listener: ITableToggleListener, protected toggleFirst: boolean) {
        super(listener, toggleFirst);
        this.eventSubscriberId = IdService.generateDateBasedId('ArticleTableToggleLayer-');
        EventService.getInstance().subscribe('ScrollToArticleInArticleTable', this);
    }

    public async eventPublished(data: any): Promise<void> {
        const articleId = data;
        const rows = await this.getPreviousLayer().getRows();
        const index = rows.findIndex((r) => r.object.ArticleID === articleId);
        if (index !== -1) {
            const row = rows[index];
            if (this.rowIsToggled(row)) {
                this.toggleListener.forEach((l) => l.rowToggled(row, index, this.tableId));
            } else {
                this.toggleRow(row);
            }
        }
    }
}
