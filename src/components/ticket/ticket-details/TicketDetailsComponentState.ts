import { ConfiguredWidget, Ticket } from '@kix/core/dist/model';
import { ILabelProvider } from '@kix/core/dist/browser';

export class TicketDetailsComponentState {

    public constructor(
        public ticketId: number = null,
        public ticket: Ticket = null,
        public lanes: ConfiguredWidget[] = [],
        public tabs: ConfiguredWidget[] = [],
        public activeTabId: string = null,
        public generalActions: string[] = [],
        public ticketActions: string[] = [],
        public ticketHook: string = '',
        public ticketHookDivider: string = '',
        public loading: boolean = false
    ) { }

}
