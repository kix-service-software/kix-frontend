import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleDeleteActionComponent {

    private doAction(): void {
        alert('Löschen');
        // ApplicationService.getInstance().toggleMainDialog('article-delete-dialog');
    }

}

module.exports = ArticleDeleteActionComponent;
