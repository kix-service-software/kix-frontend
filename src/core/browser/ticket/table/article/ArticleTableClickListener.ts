import { ITableClickListener, OverlayService } from '../../..';
import { Article, ArticleProperty, OverlayWidgetData, OverlayType, ComponentContent } from '../../../../model';
import { ClientStorageService } from '../../../ClientStorageService';
import { IdService } from '../../../IdService';
import { ComponentsService } from '../../../components';

export class ArticleTableClickListener implements ITableClickListener<Article> {

    public rowClicked(article: Article, columnId: string, event: any): void {
        if (columnId === ArticleProperty.ATTACHMENT) {
            if (article.Attachments && article.Attachments.length) {
                const data = {
                    article
                };

                OverlayService.getInstance().openOverlay(
                    OverlayType.INFO,
                    'article-attachment-widget',
                    new ComponentContent('ticket-article-attachment-list', data, article),
                    'Anlagen',
                    false,
                    [event.pageX, event.pageY]
                );
            }
        }
    }

}
