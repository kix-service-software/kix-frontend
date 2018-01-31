import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class EditArticleActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleMainDialog('new-note-article-dialog');
    }

}

module.exports = EditArticleActionComponent;
