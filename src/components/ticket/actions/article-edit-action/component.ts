import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleEditActionComponent {

    private doAction(): void {
        alert('Bearbeiten');
        // ApplicationStore.getInstance().toggleMainDialog('article-edit-dialog');
    }

}

module.exports = ArticleEditActionComponent;
