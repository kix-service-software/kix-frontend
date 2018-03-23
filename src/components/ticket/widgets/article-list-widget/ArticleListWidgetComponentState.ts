import { StandardTable } from '@kix/core/dist/browser';
import { Article, IAction, WidgetComponentState } from '@kix/core/dist/model';

import { ArticleListSettings } from './ArticleListSettings';

export class ArticleListWidgetComponentState extends WidgetComponentState<ArticleListSettings> {

    public ticketId: number = null;

    public standardTable: StandardTable<Article> = null;

    public articles: Article[] = [];

    public expandedArticles: number[] = [];

    public generalArticleActions: IAction[] = [];

    public filterValue: string = '';

}
