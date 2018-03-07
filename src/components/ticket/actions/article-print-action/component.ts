import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticlePrintActionComponent {

    private doAction(): void {
        alert('Drucken');
        // ApplicationStore.getInstance().toggleMainDialog('article-print-dialog');
    }

}

module.exports = ArticlePrintActionComponent;
