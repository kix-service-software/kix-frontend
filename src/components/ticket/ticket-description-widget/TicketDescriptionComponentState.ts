import { Attachment, WidgetConfiguration } from '@kix/core/dist/model';

export class TicketDescriptionComponentState {

    public instanceId: string = null;

    public ticketId: number = null;

    public widgetConfiguration: WidgetConfiguration = null;

    public description: string = null;

    public attachments: Attachment[] = [];
}
