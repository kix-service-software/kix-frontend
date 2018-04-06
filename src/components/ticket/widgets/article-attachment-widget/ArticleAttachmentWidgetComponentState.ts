import { IAction, Article, ConfiguredWidget, WidgetConfiguration } from "@kix/core/dist/model";

export class ArticleAttachmentWidgetComponentState {

    public constructor(
        public actions: IAction[] = [],
        public article: Article = null,
        public configuration: WidgetConfiguration = null
    ) { }

}
