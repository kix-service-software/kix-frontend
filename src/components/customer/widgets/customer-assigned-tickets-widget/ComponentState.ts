import { StandardTable } from "@kix/core/dist/browser";
import { Customer, WidgetComponentState, AbstractAction, Ticket, WidgetConfiguration } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public customer: Customer = null,
        public ticketCount: number = 0,
        public openTicketsConfig: WidgetConfiguration = null,
        public openTicketsTable: StandardTable<Ticket> = null
    ) {
        super();
    }

}
