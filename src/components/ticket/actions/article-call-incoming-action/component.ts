import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleCallIncomingActionComponent {

    private doAction(): void {
        alert('Anruf eingehend');
        // ApplicationService.getInstance().toggleMainDialog('article-call-incoming-dialog');
    }

}

module.exports = ArticleCallIncomingActionComponent;
