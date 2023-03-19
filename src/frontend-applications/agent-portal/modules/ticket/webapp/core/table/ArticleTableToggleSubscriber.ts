/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IEventSubscriber } from '../../../../../modules/base-components/webapp/core/IEventSubscriber';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { Article } from '../../../model/Article';
import { TicketService } from '..';
import { ArticleFlag } from '../../../model/ArticleFlag';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { TableEvent } from '../../../../table/model/TableEvent';
import { TableEventData } from '../../../../table/model/TableEventData';

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
