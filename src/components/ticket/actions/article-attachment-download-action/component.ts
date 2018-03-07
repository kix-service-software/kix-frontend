import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleAttachmentDownloadActionComponent {

    private doAction(): void {
        alert('Download');
        // ApplicationStore.getInstance().toggleMainDialog('article-attachment-download-dialog');
    }

}

module.exports = ArticleAttachmentDownloadActionComponent;
