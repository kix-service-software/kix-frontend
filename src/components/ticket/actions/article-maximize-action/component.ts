import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticlePrintActionComponent {

    private doAction(): void {
        alert('Großansicht');
        // ApplicationStore.getInstance().toggleMainDialog('article-maximize-dialog');
    }

}

module.exports = ArticlePrintActionComponent;
