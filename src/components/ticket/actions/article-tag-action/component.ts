import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleTagActionComponent {

    private doAction(): void {
        alert('Taggen/Flaggen');
        // ApplicationStore.getInstance().toggleMainDialog('article-tag-dialog');
    }

}

module.exports = ArticleTagActionComponent;
