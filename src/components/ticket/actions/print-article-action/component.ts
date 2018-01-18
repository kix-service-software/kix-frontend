import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class PrintArticleActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('print-article-dialog');
    }

}

module.exports = PrintArticleActionComponent;
