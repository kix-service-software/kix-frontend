import { TicketArticleMetadataComponentState } from './TicketArticleMetadataComponentState';
import { ArticleLabelProvider } from '../../../core/browser/ticket';

class TicketArticleMetadataComponent {

    private state: TicketArticleMetadataComponentState;

    public onCreate(): void {
        this.state = new TicketArticleMetadataComponentState();
        this.state.labelProvider = new ArticleLabelProvider();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
    }

}

module.exports = TicketArticleMetadataComponent;
