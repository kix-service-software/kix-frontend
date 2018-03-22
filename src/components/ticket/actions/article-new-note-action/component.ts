import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleNewNoteActionComponent {

    private doAction(): void {
        alert('Neue Notiz');
        // ApplicationService.getInstance().toggleMainDialog('article-new-note-dialog');
    }

}

module.exports = ArticleNewNoteActionComponent;
