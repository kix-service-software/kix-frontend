import { ConfiguredWidget, AbstractAction, Customer } from "@kix/core/dist/model";
import { CustomerDetailsContextConfiguration } from "@kix/core/dist/browser/customer";

export class ComponentState {

    public constructor(
        public instanceId: string = '20180710-customer-details',
        public customerId: string = null,
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public generalActions: AbstractAction[] = [],
        public customerActions: AbstractAction[] = [],
        public loading: boolean = false,
        public configuration: CustomerDetailsContextConfiguration = null,
        public customer: Customer = null,
        public error: any = null
    ) { }

}
