import { Attachment, WidgetConfiguration } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model';

export class TicketDescriptionComponentState extends WidgetComponentState {

    public ticketId: number = null;

    public firstArticleId: number = null;

    public description: string = null;

    public ticketNotes: string = null;

    public attachments: Attachment[] = [];
}
