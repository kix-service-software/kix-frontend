import { ConfiguredWidget, Ticket, AbstractAction } from '@kix/core/dist/model';
import { TicketDetailsContextConfiguration } from '@kix/core/dist/browser/ticket';

export class ComponentState {

    public constructor(
        public instanceId: string = '20180710-ticket-details',
        public ticketId: number = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public contentWidgets: ConfiguredWidget[] = [],
        public generalActions: AbstractAction[] = [],
        public ticketActions: AbstractAction[] = [],
        public loading: boolean = true,
        public ticketDetailsConfiguration: TicketDetailsContextConfiguration = null,
        public ticket: Ticket = null,
        public hasError: boolean = false,
        public error: any = null
    ) { }

}
