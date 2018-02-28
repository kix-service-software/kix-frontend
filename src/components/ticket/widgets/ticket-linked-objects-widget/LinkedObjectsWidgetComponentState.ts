import { TicketDetails } from '@kix/core/dist/model';
import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { StandardTable } from '@kix/core/dist/browser';

export class LinkedObjectsWidgetComponentState extends WidgetComponentState<LinkedObjectsSettings> {

    public ticketId: number = null;

    public ticketDetails: TicketDetails = null;

    public linkCount: number = 0;

    public linkedObjectGroups: Array<[string, number, StandardTable<any>]> = [];

}
