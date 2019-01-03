import { WidgetComponentState, AbstractAction } from "../../../../../core/model";
import { StandardTable } from "../../../../../core/browser";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public table: StandardTable = null,
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
