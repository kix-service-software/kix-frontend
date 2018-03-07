import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleNewNoteActionComponent {

    private doAction(): void {
        alert('Neue Notiz');
        // ApplicationStore.getInstance().toggleMainDialog('article-new-note-dialog');
    }

}

module.exports = ArticleNewNoteActionComponent;
