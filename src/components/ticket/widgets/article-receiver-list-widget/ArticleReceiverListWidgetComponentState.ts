import { ArticleReceiver, WidgetConfiguration } from '@kix/core/dist/model';

export class ArticleReceiverListWidgetComponentState {

    public title: string = null;

    public receiverList: ArticleReceiver[] = [];

    public instanceId: string = "article-receiver-list-widget";

    public configuration: WidgetConfiguration = null;

}
