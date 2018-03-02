import { ApplicationStore } from "@kix/core/dist/browser/application/ApplicationStore";

export class CollectiveArticleActionComponent {

    private doAction(): void {
        alert('Sammelaktionen ...');
        // ApplicationStore.getInstance().toggleMainDialog('call-incoming-article-dialog');
    }

}

module.exports = CollectiveArticleActionComponent;
