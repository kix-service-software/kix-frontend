import { TicketArticleDetailsComponentState } from './TicketArticleDetailsComponentState';
import {
    Article, Ticket, KIXObjectType, ContextMode,
    KIXObjectLoadingOptions, ArticlesLoadingOptions
} from '@kix/core/dist/model';
import { ContextService } from '@kix/core/dist/browser';

export class TicketArticleDetailsComponent {

    private state: TicketArticleDetailsComponentState;

    public onCreate(input: any): void {
        this.state = new TicketArticleDetailsComponentState();
    }

    public onInput(input: any): void {
        this.state.inputObject = input.article;
    }

    public async onMount(): Promise<void> {
        if (this.state.inputObject instanceof Article) {
            this.state.article = this.state.inputObject;
        } else if (this.state.inputObject instanceof Ticket) {
            const ticket = (this.state.inputObject as Ticket);
            const articles = await ContextService.getInstance().loadObjects<Article>(
                KIXObjectType.ARTICLE, null, ContextMode.DASHBOARD,
                new KIXObjectLoadingOptions(), new ArticlesLoadingOptions(ticket.TicketID)
            );

            if (articles) {
                this.state.article = articles[0];
            }
        }

        this.state.loading = false;
    }
}

module.exports = TicketArticleDetailsComponent;
