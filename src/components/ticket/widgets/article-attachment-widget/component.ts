import { ArticleAttachmentWidgetComponentState } from './ArticleAttachmentWidgetComponentState';
import { ActionFactory } from '@kix/core/dist/browser';

class ArticleAttachmentWidget {

    private state: ArticleAttachmentWidgetComponentState;

    public onCreate(): void {
        this.state = new ArticleAttachmentWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
        if (this.state.article) {
            this.state.actions = ActionFactory.getInstance().generateActions(
                ['article-attachment-zip-download'], false, this.state.article
            );
        }
    }

}

module.exports = ArticleAttachmentWidget;
