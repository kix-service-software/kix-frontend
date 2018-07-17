import { WidgetComponentState, Contact, Customer, AbstractAction } from "@kix/core/dist/model";
import { StandardTable, TableConfiguration } from "@kix/core/dist/browser";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public contact: Contact = null,
        public customerTable: StandardTable<Customer> = null,
        public filterValue: string = '',
        public title: string = '',
        public actions: AbstractAction[] = [],
        public loading: boolean = false
    ) {
        super();
    }

}
