import { TicketTypeLabelProvider } from "@kix/core/dist/browser/ticket";
import { WidgetComponentState, AbstractAction, TicketType } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TicketTypeLabelProvider = null,
        public actions: AbstractAction[] = [],
        public ticketType: TicketType = null
    ) {
        super();
    }

}
