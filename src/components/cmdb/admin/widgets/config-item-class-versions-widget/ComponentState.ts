import { WidgetComponentState, AbstractAction } from "../../../../../core/model";
import { ITable } from "../../../../../core/browser";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public table: ITable = null,
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
