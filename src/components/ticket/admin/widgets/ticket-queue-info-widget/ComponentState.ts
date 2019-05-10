import { QueueLabelProvider } from "../../../../../core/browser/ticket";
import { WidgetComponentState, AbstractAction, Queue } from "../../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public labelProvider: QueueLabelProvider = null,
        public actions: AbstractAction[] = [],
        public queue: Queue = null
    ) {
        super();
    }

}
