import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleDeleteActionComponent {

    private doAction(): void {
        alert('Löschen');
        // ApplicationStore.getInstance().toggleMainDialog('article-delete-dialog');
    }

}

module.exports = ArticleDeleteActionComponent;
