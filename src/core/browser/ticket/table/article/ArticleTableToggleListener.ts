import { ITableToggleListener, TableRow } from '../../..';
import { Article, ArticleFlag } from '../../../../model';
import { TicketService } from '../..';

export class ArticleTableToggleListener implements ITableToggleListener {

    public rowToggled(row: TableRow<Article>, rowIndex: number, tableId: string): void {
        if (row.object.isUnread()) {
            TicketService.getInstance().setArticleSeenFlag(row.object.TicketID, row.object.ArticleID);
            if (row.object.Flags) {
                const index = row.object.Flags.findIndex((f) => f.Name.toLocaleLowerCase() === 'seen');
                if (index !== -1) {
                    row.object.Flags.splice(index, 1);
                }

                const flag = new ArticleFlag(row.object.ArticleID, 'Seen', '1');
                row.object.Flags.push(flag);
            }
        }
    }

}
