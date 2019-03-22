import { TicketTypeLabelProvider } from "../../../../../core/browser/ticket";
import { WidgetComponentState, AbstractAction, Role } from "../../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: TicketTypeLabelProvider = null,
        public actions: AbstractAction[] = [],
        public role: Role = null
    ) {
        super();
    }

}
