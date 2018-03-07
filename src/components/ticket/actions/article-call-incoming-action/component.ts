import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleCallIncomingActionComponent {

    private doAction(): void {
        alert('Anruf eingehend');
        // ApplicationStore.getInstance().toggleMainDialog('article-call-incoming-dialog');
    }

}

module.exports = ArticleCallIncomingActionComponent;
