import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class EditArticleActionComponent {

    private doAction(): void {
        ApplicationStore.getInstance().toggleDialog('edit-article-dialog');
    }

}

module.exports = EditArticleActionComponent;
