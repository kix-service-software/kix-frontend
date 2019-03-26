import { WidgetComponentState, AbstractAction, Role } from "../../../../../core/model";
import { ITable } from "../../../../../core/browser";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public actions: AbstractAction[] = [],
        public table: ITable = null
    ) {
        super();
    }

}
