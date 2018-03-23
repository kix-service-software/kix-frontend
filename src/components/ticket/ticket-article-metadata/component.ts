import { TicketArticleMetadataComponentState } from './TicketArticleMetadataComponentState';
import { ArticleLabelProvider } from '@kix/core/dist/browser/ticket';

class TicketArticleMetadataComponent {

    private state: TicketArticleMetadataComponentState;

    public onCreate(): void {
        this.state = new TicketArticleMetadataComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
    }

    public onMount(): void {
        this.state.labelProvider = new ArticleLabelProvider();
    }

}

module.exports = TicketArticleMetadataComponent;
