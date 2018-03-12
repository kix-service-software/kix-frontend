import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { LinkedObjectsSettings } from './LinkedObjectsSettings';
import { StandardTable } from '@kix/core/dist/browser';
import { Ticket } from '@kix/core/dist/model';

export class LinkedObjectsWidgetComponentState extends WidgetComponentState<LinkedObjectsSettings> {

    public ticketId: number = null;

    public ticket: Ticket = null;

    public linkCount: number = 0;

    public linkedObjectGroups: Array<[string, number, StandardTable<any>]> = [];

}
