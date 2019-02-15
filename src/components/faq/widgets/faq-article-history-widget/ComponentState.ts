import { ITable } from "../../../../core/browser";
import { AbstractAction, WidgetComponentState } from "../../../../core/model";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public table: ITable = null,
        public actions: AbstractAction[] = [],
        public filterCount: number = null
    ) {
        super();
    }

}
