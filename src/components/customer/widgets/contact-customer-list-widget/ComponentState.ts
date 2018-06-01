import { WidgetComponentState, Contact, Customer } from "@kix/core/dist/model";
import { StandardTable } from "@kix/core/dist/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public contact: Contact = null,
        public customerTable: StandardTable<Customer> = null,
        public filterValue: string = '',
        public title: string = ''
    ) {
        super();
    }

}
