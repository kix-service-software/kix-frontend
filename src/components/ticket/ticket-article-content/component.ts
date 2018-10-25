import { ComponentState } from './TicketArticleContentComponentState';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { Article } from '@kix/core/dist/model';

class Component {

    private state: ComponentState;

    private article: Article = null;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.article = input.article;
        this.prepareContent();
    }

    public async prepareContent(): Promise<void> {
        if (this.article) {
            if (this.article.bodyAttachment) {
                const AttachmentWithContent = await TicketService.getInstance().loadArticleAttachment(
                    this.article.TicketID, this.article.ArticleID, this.article.bodyAttachment.ID
                );
                this.state.content = atob(AttachmentWithContent.Content);
            } else {
                this.state.content = this.article.Body;
            }
        }
    }
}

module.exports = Component;
