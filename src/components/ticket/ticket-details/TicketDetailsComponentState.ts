import { ConfiguredWidget, Ticket, AbstractAction, TicketDetailsDashboardConfiguration } from '@kix/core/dist/model';
import { ILabelProvider } from '@kix/core/dist/browser';

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
        public ticketDeatilsConfiguration: TicketDetailsDashboardConfiguration = null
    ) { }

}
