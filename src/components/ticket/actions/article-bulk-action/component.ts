import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleBulkActionComponent {

    private doAction(): void {
        alert('Sammelaktionen ...');
        // ApplicationService.getInstance().toggleMainDialog('article-bulk-dialog');
    }

}

module.exports = ArticleBulkActionComponent;
