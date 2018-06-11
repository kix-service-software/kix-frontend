import { StandardTable } from '@kix/core/dist/browser';
import { AbstractAction, Ticket, WidgetComponentState } from '@kix/core/dist/model';

import { LinkedObjectsSettings } from './LinkedObjectsSettings';

export class LinkedObjectsWidgetComponentState extends WidgetComponentState<LinkedObjectsSettings> {

    public constructor(
        public ticketId: number = null,
        public linkCount: number = 0,
        public linkedObjectGroups: Array<[string, number, StandardTable<any>]> = [],
        public actions: AbstractAction[] = [],
        public ticket: Ticket = null
    ) {
        super();
    }

}
