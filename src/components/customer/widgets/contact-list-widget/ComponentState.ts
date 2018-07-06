import { StandardTable, TableConfiguration } from "@kix/core/dist/browser";
import { WidgetComponentState, AbstractAction, Contact } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public actions: AbstractAction[] = [],
        public standardTable: StandardTable<Contact> = null
    ) {
        super();
    }

}
