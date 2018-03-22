import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleEditActionComponent {

    private doAction(): void {
        alert('Bearbeiten');
        // ApplicationService.getInstance().toggleMainDialog('article-edit-dialog');
    }

}

module.exports = ArticleEditActionComponent;
