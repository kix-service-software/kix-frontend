import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleMaximizeActionComponent {

    private doAction(): void {
        alert('Großansicht');
        // ApplicationService.getInstance().toggleMainDialog('article-maximize-dialog');
    }

}

module.exports = ArticleMaximizeActionComponent;
