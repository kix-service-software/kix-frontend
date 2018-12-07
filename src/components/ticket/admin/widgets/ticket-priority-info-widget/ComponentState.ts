import { TicketPriorityLabelProvider } from "@kix/core/dist/browser/ticket";
import { WidgetComponentState, AbstractAction, TicketPriority } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TicketPriorityLabelProvider = null,
        public actions: AbstractAction[] = [],
        public ticketPriority: TicketPriority = null
    ) {
        super();
    }

}
