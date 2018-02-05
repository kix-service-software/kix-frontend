import { Attachment } from '@kix/core/dist/model';
import { TicketService } from '@kix/core/dist/browser/ticket';
import { ArticleAttachmentComponentState } from './ArticleAttachmentComponentState';

declare var window: any;

class ArticleAttachmentComponent {

    private state: ArticleAttachmentComponentState;

    public onCreate(): void {
        this.state = new ArticleAttachmentComponentState();
    }

    public onInput(input: any): void {
        this.state.ticketId = input.ticketId;
        this.state.articleId = input.articleId;
        this.state.attachment = input.attachment;

        if (this.state.attachment) {
            const fileName = this.state.attachment.Filename;
            const idx = fileName.lastIndexOf('.');
            if (idx >= 0) {
                this.state.extension = fileName.substring(idx + 1, fileName.length);
            }
        }
    }

    private async download(): Promise<void> {
        if (!this.state.progress && this.state.articleId && this.state.attachment) {
            this.state.progress = true;
            const attachment = await this.loadArticleAttachment(this.state.articleId, this.state.attachment.ID);
            this.state.progress = false;

            const blob = this.b64toBlob(attachment.Content, attachment.ContentType);
            const objectURL = URL.createObjectURL(blob);

            const a = window.document.createElement('a');
            a.href = objectURL;
            a.download = attachment.Filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    }

    private async loadArticleAttachment(articleId: number, attachmentId: number): Promise<Attachment> {
        const attachment = await TicketService.getInstance().loadArticleAttachment(
            this.state.ticketId, articleId, attachmentId
        );
        return attachment;
    }

    private b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }
}

module.exports = ArticleAttachmentComponent;
