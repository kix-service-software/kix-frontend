import { TableConfiguration, ITable } from "../../../../core/browser";
import { Contact, WidgetComponentState, AbstractAction, Ticket, WidgetConfiguration } from "../../../../core/model";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public contact: Contact = null,
        public escalatedTicketsConfig: WidgetConfiguration = null,
        public escalatedTicketsTable: ITable = null,
        public escalatedFilterValue: string = null,
        public reminderTicketsConfig: WidgetConfiguration = null,
        public reminderTicketsTable: ITable = null,
        public reminderFilterValue: string = null,
        public newTicketsConfig: WidgetConfiguration = null,
        public newTicketsTable: ITable = null,
        public newFilterValue: string = null,
        public openTicketsConfig: WidgetConfiguration = null,
        public openTicketsTable: ITable = null,
        public openFilterValue: string = null,
        public pendingTicketsConfig: WidgetConfiguration = null,
        public pendingTicketsTable: ITable = null,
        public pendingFilterValue: string = null,
        public actions: AbstractAction[] = [],
        public escalatedTicketsCount: number = 0,
        public reminderTicketsCount: number = 0,
        public newTicketsCount: number = 0,
        public openTicketsCount: number = 0,
        public pendingTicketsCount: number = 0,
        public escalatedTicketsFilterCount: number = null,
        public reminderTicketsFilterCount: number = null,
        public newTicketsFilterCount: number = null,
        public openTicketsFilterCount: number = null,
        public pendingTicketsFilterCount: number = null
    ) {
        super();
    }

}
