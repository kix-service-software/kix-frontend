import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleCallOutgoingActionComponent {

    private doAction(): void {
        alert('Anruf ausgehend');
        // ApplicationService.getInstance().toggleMainDialog('article-call-outgoing-dialog');
    }

}

module.exports = ArticleCallOutgoingActionComponent;
