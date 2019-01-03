import { StandardTable, TableConfiguration } from "../../../../core/browser";
import { Customer, WidgetComponentState, AbstractAction, Ticket, WidgetConfiguration } from "../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public customer: Customer = null,
        public escalatedTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public escalatedTicketsTable: StandardTable<Ticket> = null,
        public escalatedFilterValue: string = null,
        public reminderTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public reminderTicketsTable: StandardTable<Ticket> = null,
        public reminderFilterValue: string = null,
        public newTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public newTicketsTable: StandardTable<Ticket> = null,
        public newFilterValue: string = null,
        public openTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public openTicketsTable: StandardTable<Ticket> = null,
        public openFilterValue: string = null,
        public pendingTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public pendingTicketsTable: StandardTable<Ticket> = null,
        public pendingFilterValue: string = null,
        public loadEscalatedTickets: boolean = false,
        public loadReminderTickets: boolean = false,
        public loadOpenTickets: boolean = false,
        public loadNewTickets: boolean = false,
        public loadPendingTickets: boolean = false,
        public actions: AbstractAction[] = [],
        public openTicketIds: number[] = null,
        public escalatedTicketIds: number[] = null,
        public reminderTicketIds: number[] = null,
        public newTicketIds: number[] = null,
        public pendingTicketIds: number[] = null,
        public openFilterCount: number = null,
        public escalatedFilterCount: number = null,
        public reminderFilterCount: number = null,
        public newFilterCount: number = null,
        public pendingFilterCount: number = null
    ) {
        super();
    }

}
