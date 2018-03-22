import { ApplicationService } from "@kix/core/dist/browser/application/ApplicationService";

export class ArticleCommunicationActionComponent {

    private doAction(): void {
        alert('Kommunikation');
        // ApplicationService.getInstance().toggleMainDialog('article-communication-dialog');
    }

}

module.exports = ArticleCommunicationActionComponent;
