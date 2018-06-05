import { StandardTable } from "@kix/core/dist/browser";
import { Contact, WidgetComponentState, AbstractAction, Ticket, WidgetConfiguration } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public contact: Contact = null,
        public openTicketsConfig: WidgetConfiguration = null,
        public openTicketsTable: StandardTable<Ticket> = null,
        public escalatedTicketsConfig: WidgetConfiguration = null,
        public escalatedTicketsTable: StandardTable<Ticket> = null,
        public reminderTicketsConfig: WidgetConfiguration = null,
        public reminderTicketsTable: StandardTable<Ticket> = null,
        public newTicketsConfig: WidgetConfiguration = null,
        public newTicketsTable: StandardTable<Ticket> = null,
        public pendingTicketsConfig: WidgetConfiguration = null,
        public pendingTicketsTable: StandardTable<Ticket> = null,
        public loadEscalatedTickets: boolean = false,
        public loadReminderTickets: boolean = false,
        public loadOpenTickets: boolean = false,
        public loadNewTickets: boolean = false,
        public loadPendingTickets: boolean = false,
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
