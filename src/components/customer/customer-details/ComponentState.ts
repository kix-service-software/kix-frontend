import { ConfiguredWidget, AbstractAction, Customer } from "@kix/core/dist/model";
import { CustomerDetailsContextConfiguration } from "@kix/core/dist/browser/customer";

export class ComponentState {

    public constructor(
        public instanceId: string = '20180710-customer-details',
        public lanes: ConfiguredWidget[] = [],
        public tabWidgets: ConfiguredWidget[] = [],
        public contentActions: AbstractAction[] = [],
        public loading: boolean = false,
        public configuration: CustomerDetailsContextConfiguration = null,
        public customer: Customer = null,
        public error: any = null
    ) { }

}
