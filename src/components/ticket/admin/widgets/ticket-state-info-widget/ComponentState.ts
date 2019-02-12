import { TicketStateLabelProvider } from "../../../../../core/browser/ticket";
import { WidgetComponentState, AbstractAction, TicketState } from "../../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TicketStateLabelProvider = null,
        public actions: AbstractAction[] = [],
        public ticketState: TicketState = null
    ) {
        super();
    }

}
