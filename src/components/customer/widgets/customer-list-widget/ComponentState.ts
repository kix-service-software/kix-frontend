import { StandardTable, TableConfiguration } from "@kix/core/dist/browser";
import { Customer, WidgetComponentState, AbstractAction } from "@kix/core/dist/model";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public actions: AbstractAction[] = [],
        public standardTable: StandardTable<Customer> = null,
        public title: string = "Übersicht Kunden",
        public filterCount: number = null
    ) {
        super();
    }

}
