import { TicketArticleDetailsComponentState } from './TicketArticleDetailsComponentState';

export class TicketArticleDetailsComponent {

    private state: TicketArticleDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketArticleDetailsComponentState();
    }

    public onInput(input: any): void {
        this.state.article = input.article;
    }

    public onMount(): void {
        // nothing
    }
}

module.exports = TicketArticleDetailsComponent;
