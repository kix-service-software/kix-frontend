import { IAction, Article } from "@kix/core/dist/model";

export class ArticleAttachmentWidgetComponentState {

    public constructor(
        public actions: IAction[] = [],
        public article: Article = null
    ) { }

}
