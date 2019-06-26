import { TicketArticleDetailsComponentState } from './TicketArticleDetailsComponentState';
import {
    Article, Ticket, KIXObjectType, KIXObjectLoadingOptions, ArticleProperty, ArticleLoadingOptions
} from '../../../core/model';
import { KIXObjectService } from '../../../core/browser';

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
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, null,
                new KIXObjectLoadingOptions(null, 'Article.-ArticleID', 1, [ArticleProperty.ATTACHMENTS]),
                new ArticleLoadingOptions(ticket.TicketID)
            );

            if (articles && articles.length) {
                this.state.article = articles[0];
            }
        }

        this.state.loading = false;
    }
}

module.exports = TicketArticleDetailsComponent;
