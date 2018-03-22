import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";
import { TicketService } from "@kix/core/dist/browser/ticket";
import { ZipAttachmentComponentState } from './ZipAttachmentComponentState';

export class ArticleAttachmentZipDownloadActionComponent {

    private state: ZipAttachmentComponentState;

    public onCreate(): void {
        this.state = new ZipAttachmentComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input;
    }

    private async doAction(): Promise<void> {
        if (this.state.article) {
            const attachment = await TicketService.getInstance().loadArticleZipAttachment(
                this.state.article.TicketID, this.state.article.ArticleID
            );

            TicketService.getInstance().startBrowserDownload(attachment);
        }
    }

}

module.exports = ArticleAttachmentZipDownloadActionComponent;
