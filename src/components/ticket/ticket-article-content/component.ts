import { TicketArticleContentComponentState } from './TicketArticleContentComponentState';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { Attachment } from '@kix/core/dist/model/';

class TicketArticleContentComponent {

    private state: TicketArticleContentComponentState;

    public onCreate(input: any): void {
        this.state = new TicketArticleContentComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
        this.prepareContent();
    }

    public async prepareContent(): Promise<void> {
        if (this.state.article) {
            this.state.isContentHTML = false;
            this.state.content = this.state.article.Body;

            if (this.state.article.bodyAttachment) {
                const AttachmentWithContent = await TicketService.getInstance().loadArticleAttachment(
                    this.state.article.TicketID, this.state.article.ArticleID, this.state.article.bodyAttachment.ID
                );

                if (AttachmentWithContent) {
                    this.state.isContentHTML = true;
                    this.state.content = atob(AttachmentWithContent.Content);
                }
            }
        }
    }
}

module.exports = TicketArticleContentComponent;
