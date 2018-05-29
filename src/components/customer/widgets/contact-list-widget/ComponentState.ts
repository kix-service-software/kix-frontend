import { StandardTable } from "@kix/core/dist/browser";
import { WidgetComponentState, AbstractAction, Contact } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<any> {

    public constructor(
        public actions: AbstractAction[] = [],
        public standardTable: StandardTable<Contact> = null
    ) {
        super();
    }

}
