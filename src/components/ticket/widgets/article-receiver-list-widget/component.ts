import { ArticleReceiverListWidgetComponentState } from './ArticleReceiverListWidgetComponentState';
import { ArticleProperty } from '@kix/core/dist/model';

class ArticleReceiverListWidget {

    private state: ArticleReceiverListWidgetComponentState;

    public onCreate(): void {
        this.state = new ArticleReceiverListWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.receiverList = input;
        this.state.title = 'Empfänger';
        if (this.state.receiverList) {
            // TODO: ggf. über "type" eine Bezeichnung/Übersetzung ermitteln, statt es direkt zu verwenden
            this.state.title += ': ' + this.state.receiverList[0].type;
        }
    }

}

module.exports = ArticleReceiverListWidget;
