import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class EditArticleActionComponent {

    private doAction(): void {
        alert('Neue Notiz');
        // ApplicationStore.getInstance().toggleMainDialog('article-new-note-dialog');
    }

}

module.exports = EditArticleActionComponent;
