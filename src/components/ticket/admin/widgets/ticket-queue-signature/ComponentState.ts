import { WidgetComponentState, AbstractAction, Queue } from "../../../../../core/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public title: string = '',
        public actions: AbstractAction[] = [],
        public queue: Queue = null
    ) {
        super();
    }

}
