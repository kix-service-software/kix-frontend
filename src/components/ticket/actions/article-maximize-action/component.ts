import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleMaximizeActionComponent {

    private doAction(): void {
        alert('Großansicht');
        // ApplicationStore.getInstance().toggleMainDialog('article-maximize-dialog');
    }

}

module.exports = ArticleMaximizeActionComponent;
