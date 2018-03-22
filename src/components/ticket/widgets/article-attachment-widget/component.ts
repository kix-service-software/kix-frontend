import { ArticleAttachmentWidgetComponentState } from './ArticleAttachmentWidgetComponentState';

class ArticleAttachmentWidget {

    private state: ArticleAttachmentWidgetComponentState;

    public onCreate(): void {
        this.state = new ArticleAttachmentWidgetComponentState();
    }

}

module.exports = ArticleAttachmentWidget;
