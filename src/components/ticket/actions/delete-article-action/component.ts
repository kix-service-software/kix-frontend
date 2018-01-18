import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class PrintArticleActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('delete-article-dialog');
    }

}

module.exports = PrintArticleActionComponent;
