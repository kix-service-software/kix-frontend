import { TableConfiguration, ITable } from "../../../../core/browser";
import { Customer, WidgetComponentState, AbstractAction, Ticket, WidgetConfiguration } from "../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public customer: Customer = null,
        public escalatedTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public escalatedTicketsTable: ITable = null,
        public escalatedFilterValue: string = null,
        public reminderTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public reminderTicketsTable: ITable = null,
        public reminderFilterValue: string = null,
        public newTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public newTicketsTable: ITable = null,
        public newFilterValue: string = null,
        public openTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
        public openTicketsTable: ITable = null,
        public openFilterValue: string = null,
        public pendingTicketsConfig: WidgetConfiguration<TableConfiguration> = null,
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
