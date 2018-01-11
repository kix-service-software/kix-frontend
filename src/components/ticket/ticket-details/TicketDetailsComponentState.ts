import { ConfiguredWidget, Ticket, Article } from '@kix/core/dist/model';

export class TicketDetailsComponentState {

    public constructor(
        public ticketId: number = null,
        public ticket: Ticket = null,
        public articles: Article[] = [],
        public lanes: ConfiguredWidget[] = [],
        public tabs: ConfiguredWidget[] = [],
        public activeTabId: string = null
    ) { }

}
