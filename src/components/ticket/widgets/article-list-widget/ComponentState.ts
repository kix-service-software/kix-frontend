import { StandardTable } from '@kix/core/dist/browser';
import { Article, IAction, WidgetComponentState, Ticket } from '@kix/core/dist/model';

import { ArticleListSettings } from './ArticleListSettings';

export class ComponentState extends WidgetComponentState<ArticleListSettings> {

    public constructor(
        public ticketId: number = null,
        public instanceId: string = null,
        public standardTable: StandardTable<Article> = null,
        public articles: Article[] = [],
        public expandedArticles: number[] = [],
        public generalArticleActions: IAction[] = [],
        public filterValue: string = '',
        public ticket: Ticket = null,
        public title: string = null,
        public attachmentCount: number = 0,
        public loading: boolean = false,
        public eventSubscriberWidgetPrefix: string = 'ArticleListWidget'
    ) {
        super();
    }

}
