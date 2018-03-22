import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleTagActionComponent {

    private doAction(): void {
        alert('Taggen/Flaggen');
        // ApplicationService.getInstance().toggleMainDialog('article-tag-dialog');
    }

}

module.exports = ArticleTagActionComponent;
