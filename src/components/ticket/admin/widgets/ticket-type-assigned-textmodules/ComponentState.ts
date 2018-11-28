import { WidgetComponentState, AbstractAction } from "@kix/core/dist/model";
import { StandardTable } from "@kix/core/dist/browser";

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
