import { WidgetComponentState, Contact, Customer, AbstractAction } from "../../../../core/model";
import { StandardTable, TableConfiguration } from "../../../../core/browser";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public contact: Contact = null,
        public customerTable: StandardTable<Customer> = null,
        public filterValue: string = '',
        public title: string = '',
        public actions: AbstractAction[] = [],
        public filterCount: number = null
    ) {
        super();
    }

}
