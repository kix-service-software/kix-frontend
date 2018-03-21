import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleNewEmailActionComponent {

    private doAction(): void {
        alert('Neue E-Mail');
        // ApplicationService.getInstance().toggleMainDialog('article-new-email-dialog');
    }

}

module.exports = ArticleNewEmailActionComponent;
