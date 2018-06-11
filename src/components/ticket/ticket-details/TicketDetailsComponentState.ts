import { ConfiguredWidget, Ticket, AbstractAction } from '@kix/core/dist/model';
import { ILabelProvider } from '@kix/core/dist/browser';
import { TicketDetailsContextConfiguration } from '@kix/core/dist/browser/ticket';

export class TicketDetailsComponentState {

    public constructor(
        public ticketId: number = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public generalActions: AbstractAction[] = [],
        public ticketActions: AbstractAction[] = [],
        public ticketHook: string = '',
        public ticketHookDivider: string = '',
        public loadingTicket: boolean = true,
        public loadingConfig: boolean = true,
        public ticketDetailsConfiguration: TicketDetailsContextConfiguration = null,
        public ticket: Ticket = null
    ) { }

}
