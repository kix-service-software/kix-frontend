import { AbstractAction, Article, WidgetComponentState, Ticket } from '@kix/core/dist/model';

export class TicketDescriptionComponentState extends WidgetComponentState {

    public constructor(
        public ticketId: number = null,
        public firstArticle: Article = null,
        public ticketNotes: string = null,
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null
    ) {
        super();
    }

}
