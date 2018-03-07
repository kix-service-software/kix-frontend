import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class ArticleCommunicationActionComponent {

    private doAction(): void {
        alert('Kommunikation');
        // ApplicationStore.getInstance().toggleMainDialog('article-communication-dialog');
    }

}

module.exports = ArticleCommunicationActionComponent;
