import { Link, TicketDetails, WidgetConfiguration } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { TicketData } from '@kix/core/dist/browser/ticket/TicketData';

export class LinkedObjectsWidgetComponentState extends WidgetComponentState<LinkedObjectsSettings> {

    public ticketId: number = null;
    public ticketDetails: TicketDetails = null;
    public linkedObjects: Map<string, Map<any, string>> = new Map();
    public ticketData: TicketData = null;
    public linkQuantity: number = 0;

}
