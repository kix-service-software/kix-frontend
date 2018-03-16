import { Article, Attachment, WidgetConfiguration } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model';

export class TicketDescriptionComponentState extends WidgetComponentState {

    public ticketId: number = null;

    public firstArticle: Article = null;

    public ticketNotes: string = null;

}
