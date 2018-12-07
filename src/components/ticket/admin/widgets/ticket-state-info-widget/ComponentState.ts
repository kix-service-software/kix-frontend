import { TicketStateLabelProvider } from "@kix/core/dist/browser/ticket";
import { WidgetComponentState, AbstractAction, TicketState } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TicketStateLabelProvider = null,
        public actions: AbstractAction[] = [],
        public ticketState: TicketState = null
    ) {
        super();
    }

}
