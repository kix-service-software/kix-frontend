import { Article } from '@kix/core/dist/model';
import { ArticleLabelProvider } from '@kix/core/dist/browser/ticket';

export class TicketArticleMetadataComponentState {

    public article: Article = null;

    public labelProvider: ArticleLabelProvider = null;

}
