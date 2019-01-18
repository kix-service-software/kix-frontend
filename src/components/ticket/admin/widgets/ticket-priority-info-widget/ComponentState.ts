import { TicketPriorityLabelProvider } from "../../../../../core/browser/ticket";
import { WidgetComponentState, AbstractAction, TicketPriority } from "../../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TicketPriorityLabelProvider = null,
        public actions: AbstractAction[] = [],
        public ticketPriority: TicketPriority = null
    ) {
        super();
    }

}
