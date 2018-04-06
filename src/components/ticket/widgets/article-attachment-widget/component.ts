import { ArticleAttachmentWidgetComponentState } from './ArticleAttachmentWidgetComponentState';
import { ActionFactory } from '@kix/core/dist/browser';
import { ContextService } from '@kix/core/dist/browser/context';

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

        const context = ContextService.getInstance().getContext();
        this.state.configuration = context.getWidgetConfiguration(input.instanceId);

    }

}

module.exports = ArticleAttachmentWidget;
