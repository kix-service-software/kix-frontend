import { ArticleReceiverListWidgetComponentState } from './ArticleReceiverListWidgetComponentState';
import { ArticleProperty } from '@kix/core/dist/model';
import { ContextService } from '@kix/core/dist/browser/context';

class ArticleReceiverListWidget {

    private state: ArticleReceiverListWidgetComponentState;

    public onCreate(): void {
        this.state = new ArticleReceiverListWidgetComponentState();
    }

    public onInput(input: any): void {
        this.state.receiverList = input.receiver;
        this.state.configuration =
            ContextService.getInstance().getActiveContext().getWidgetConfiguration(input.instanceId);
        this.state.title = this.state.configuration ? this.state.configuration.title : 'Empfänger';
    }

}

module.exports = ArticleReceiverListWidget;
