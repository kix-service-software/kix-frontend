import { WidgetComponentState, Customer, Contact, AbstractAction } from "../../../../core/model";
import { StandardTable, TableConfiguration } from "../../../../core/browser";

export class ComponentState extends WidgetComponentState<TableConfiguration> {

    public constructor(
        public customer: Customer = null,
        public contactTable: StandardTable<Contact> = null,
        public filterValue: string = '',
        public title: string = '',
        public actions: AbstractAction[] = [],
        public loading: boolean = false,
        public filterCount: number = null
    ) {
        super();
    }

}
