import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleBulkActionComponent {

    private doAction(): void {
        alert('Sammelaktionen ...');
        // ApplicationStore.getInstance().toggleMainDialog('article-bulk-dialog');
    }

}

module.exports = ArticleBulkActionComponent;
