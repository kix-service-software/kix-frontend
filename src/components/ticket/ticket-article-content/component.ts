import { TicketArticleContentComponentState } from './TicketArticleContentComponentState';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { Attachment } from '@kix/core/dist/model/';

class TicketArticleContentComponent {

    private state: TicketArticleContentComponentState;

    public onCreate(input: any): void {
        this.state = new TicketArticleContentComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketId = Number(input.ticketId);
        this.state.article = input.article;
        this.prepareContent();
    }

    public async prepareContent(): Promise<void> {
        if (this.state.article) {
            this.state.isContentHTML = false;
            this.state.content = this.state.article.Body;

            const attachments = this.state.article.Attachments ? [...this.state.article.Attachments] : [];
            const htmlBodyAttachmentIndex = attachments.findIndex(
                (a) => a.Disposition === 'inline' && a.Filename === 'file-2'
            );
            if (htmlBodyAttachmentIndex > -1) {
                const htmlBodyAttachment = attachments[htmlBodyAttachmentIndex];

                // FIXME: AttachmentID aus dem htmlBodyAttachment verwenden
                const AttachmentWithContent = await TicketService.getInstance().loadArticleAttachment(
                    this.state.ticketId, this.state.article.ArticleID, 1
                );

                if (AttachmentWithContent) {
                    this.state.isContentHTML = true;
                    this.state.content = AttachmentWithContent.Content;
                }
            }
        }
    }
}

module.exports = TicketArticleContentComponent;
