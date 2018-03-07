import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleNewEmailActionComponent {

    private doAction(): void {
        alert('Neue E-Mail');
        // ApplicationStore.getInstance().toggleMainDialog('article-new-email-dialog');
    }

}

module.exports = ArticleNewEmailActionComponent;
