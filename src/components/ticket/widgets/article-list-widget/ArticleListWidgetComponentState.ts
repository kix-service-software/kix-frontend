import { Article } from '@kix/core/dist/model';
import { StandardTable } from '@kix/core/dist/browser';
import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { ArticleListSettings } from './ArticleListSettings';

export class ArticleListWidgetComponentState extends WidgetComponentState<ArticleListSettings> {

    public ticketId: number = null;

    public articleTableConfiguration: StandardTable<Article> = null;

    public filterValue: string = '';

    public articles: Article[] = [];

    public expandedArticles: number[] = [];

}
