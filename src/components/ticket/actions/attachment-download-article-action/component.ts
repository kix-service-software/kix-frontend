import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class EditArticleActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('attachment-download-article-dialog');
    }

}

module.exports = EditArticleActionComponent;
