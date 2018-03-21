import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleAttachmentDownloadActionComponent {

    private doAction(): void {
        alert('Download');
        // ApplicationService.getInstance().toggleMainDialog('article-attachment-download-dialog');
    }

}

module.exports = ArticleAttachmentDownloadActionComponent;
