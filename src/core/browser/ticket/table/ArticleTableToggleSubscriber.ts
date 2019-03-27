import { IEventSubscriber, EventService } from "../../event";
import { TableEventData, TableEvent } from "../../table";
import { KIXObjectType, Article, ArticleFlag } from "../../../model";
import { TicketService } from "../TicketService";

export class ArticleTableToggleSubscriber implements IEventSubscriber {

    public eventSubscriberId: string = 'ArticleTableToggleSubscriber';

    public eventPublished(data: TableEventData, eventId: string, subscriberId?: string): void {
        if (eventId === TableEvent.ROW_TOGGLED) {
            if (data.table && data.table.getObjectType() === KIXObjectType.ARTICLE && data.rowId) {
                const row = data.table.getRow(data.rowId);
                if (row) {
                    const article: Article = row.getRowObject().getObject();
                    if (article && article instanceof Article) {
                        this.setArticleSeen(article, data);
                    }
                }
            }
        }
    }

    private async setArticleSeen(article: Article, data: TableEventData): Promise<void> {
        if (article.isUnread()) {

            await TicketService.getInstance().setArticleSeenFlag(article.TicketID, article.ArticleID);

            if (article.Flags) {
                const index = article.Flags.findIndex((f) => f.Name.toLocaleLowerCase() === 'seen');
                if (index !== -1) {
                    article.Flags.splice(index, 1);
                }

                const flag = new ArticleFlag(article.ArticleID, 'Seen', '1');
                article.Flags.push(flag);

                EventService.getInstance().publish(
                    TableEvent.ROW_VALUE_CHANGED, new TableEventData(data.tableId, data.rowId)
                );
            }
        }
    }
}
