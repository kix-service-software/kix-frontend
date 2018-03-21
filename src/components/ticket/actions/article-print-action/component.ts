import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticlePrintActionComponent {

    private doAction(): void {
        alert('Drucken');
        // ApplicationService.getInstance().toggleMainDialog('article-print-dialog');
    }

}

module.exports = ArticlePrintActionComponent;
