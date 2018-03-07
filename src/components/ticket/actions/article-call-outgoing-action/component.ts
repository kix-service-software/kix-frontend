import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleCallOutgoingActionComponent {

    private doAction(): void {
        alert('Anruf ausgehend');
        // ApplicationStore.getInstance().toggleMainDialog('article-call-outgoing-dialog');
    }

}

module.exports = ArticleCallOutgoingActionComponent;
