import { AbstractAction, Article, WidgetComponentState } from '@kix/core/dist/model';

export class TicketDescriptionComponentState extends WidgetComponentState {

    public ticketId: number = null;

    public firstArticle: Article = null;

    public ticketNotes: string = null;

    public actions: AbstractAction[] = [];

}
