import { TicketArticleDetailsComponentState } from './TicketArticleDetailsComponentState';
import { Article, Ticket, KIXObjectType, ContextMode } from '@kix/core/dist/model';
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
            const tickets = await ContextService.getInstance().loadObjects<Ticket>(
                KIXObjectType.TICKET, [ticket.TicketID], ContextMode.DETAILS, null
            );

            if (tickets && tickets.length && tickets[0].Articles && tickets[0].Articles.length) {
                tickets[0].Articles.sort((a, b) => b.IncomingTime - a.IncomingTime);
                this.state.article = tickets[0].Articles[0];
            }
        }

        this.state.loading = false;
    }
}

module.exports = TicketArticleDetailsComponent;
