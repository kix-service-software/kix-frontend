import { WidgetComponentState, AbstractAction } from "../../../../../core/model";
import { StandardTable } from "../../../../../core/browser";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public title: string = '',
        public filterCount: number = 0,
        public table: StandardTable = null,
        public actions: AbstractAction[] = []
    ) {
        super();
    }

}
