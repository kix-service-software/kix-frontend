import { Attachment } from '@kix/core/dist/model';
import { TicketService } from '@kix/core/dist/browser/ticket';

declare var window: any;

class ArticleAttachmentComponent {

    private state: any;

    public onCreate(): void {
        this.state = {
            ticketId: null,
            articleId: null,
            attachment: null,
            progress: false
        };
    }

    public onInput(input: any): void {
        this.state.ticketId = input.ticketId;
        this.state.articleId = input.articleId;
        this.state.attachment = input.attachment;
    }

    private async download(): Promise<void> {
        if (!this.state.progress) {
            this.state.progress = true;
            // const attachment = await this.loadArticleAttachment(412768, this.state.attachment.AttachmentID);
            const attachment = await this.loadArticleAttachment(412768, 1);
            this.state.progress = false;

            const blobUrl = URL.createObjectURL(attachment.Content);

            window.location = blobUrl;
        }
    }

    private async loadArticleAttachment(articleId: number, attachmentId: number): Promise<Attachment> {
        const attachment = await TicketService.getInstance().loadArticleAttachment(
            this.state.ticketId, articleId, attachmentId
        );
        return attachment;
    }

}

module.exports = ArticleAttachmentComponent;
