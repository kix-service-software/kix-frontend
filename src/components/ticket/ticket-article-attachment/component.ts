import { Attachment, ObjectIcon } from '../../../core/model';
import { TicketService } from '../../../core/browser/ticket';
import { ComponentState } from './ComponentState';
import { BrowserUtil } from '../../../core/browser';

declare var window: any;

class ArticleAttachmentComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.attachment = input.attachment;

        if (this.state.attachment) {
            this.state.icon = new ObjectIcon("MIMEType", this.state.attachment.ContentType);
        }
    }

    private async download(): Promise<void> {
        if (!this.state.progress && this.state.article && this.state.attachment) {
            this.state.progress = true;
            const attachment = await this.loadArticleAttachment(this.state.attachment.ID);
            this.state.progress = false;

            BrowserUtil.startBrowserDownload(attachment.Filename, attachment.Content, attachment.ContentType);
        }
    }

    private async loadArticleAttachment(attachmentId: number): Promise<Attachment> {
        const attachment = await TicketService.getInstance().loadArticleAttachment(
            this.state.article.TicketID, this.state.article.ArticleID, attachmentId
        );
        return attachment;
    }

}

module.exports = ArticleAttachmentComponent;
